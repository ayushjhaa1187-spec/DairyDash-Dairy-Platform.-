# Frontend-Backend Integration Guide

## Overview
This guide explains how to integrate the DairyDash frontend with the backend API for production use.

## Architecture
```
Frontend (GitHub Pages)
    |
    |-- HTTP Requests -->
    |
    +-- Backend API (Heroku/Node.js)
        |
        +-- Database (MongoDB)
        +-- Authentication (JWT)
        +-- External APIs (Maps, Payments)
```

## Configuration

### 1. Backend API URL Configuration
Update the frontend to connect to your deployed backend API:

#### In script.js or API utility file:
```javascript
// Production API Base URL
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'https://your-heroku-app.herokuapp.com/api'
  : 'http://localhost:5000/api';

// Or hardcode for GitHub Pages:
const API_BASE_URL = 'https://your-heroku-app.herokuapp.com/api';
```

### 2. CORS Configuration
The backend must allow requests from your GitHub Pages domain:

#### In backend/server.js:
```javascript
const corsOptions = {
  origin: [
    'https://yourusername.github.io',
    'https://yourusername.github.io/DairyDash-Dairy-Platform.-',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
```

## API Endpoints

### Authentication Endpoints
```
POST /api/auth/register
- Register new user
- Body: { email, phone, password, name }
- Response: { user, token }

POST /api/auth/login
- User login
- Body: { email/phone, password }
- Response: { user, token }

GET /api/auth/verify
- Verify JWT token
- Headers: { Authorization: "Bearer <token>" }
- Response: { user }

POST /api/auth/logout
- User logout
```

### Product Endpoints
```
GET /api/products
- Get all products
- Query: ?category=milk&limit=20&skip=0
- Response: { products: [], total, categories }

GET /api/products/:id
- Get product details
- Response: { product, reviews, recommendations }

GET /api/products/category/:category
- Get products by category
- Response: { products: [] }
```

### Order Endpoints
```
POST /api/orders
- Create new order
- Body: { items: [], address, paymentMethod }
- Headers: { Authorization: "Bearer <token>" }
- Response: { order, totalPrice, deliveryTime }

GET /api/orders/:id
- Get order details
- Response: { order, status, items, tracking }

GET /api/orders/user/my-orders
- Get user's orders
- Response: { orders: [] }

GET /api/orders/track/:id
- Track order in real-time
- Response: { location, eta, status, deliveryPerson }
```

### Delivery Endpoints
```
GET /api/delivery/track/:orderId
- Real-time tracking
- Response: { lat, lng, eta, status }

POST /api/delivery/location
- Update delivery location (from driver)
- Body: { orderId, lat, lng }
```

## Frontend Implementation

### 1. Authentication Implementation

#### Register/Login Form:
```html
<!-- In index.html or login.html -->
<form id="loginForm">
  <input type="email" id="email" placeholder="Email or Phone">
  <input type="password" id="password" placeholder="Password">
  <button type="submit">Login</button>
</form>
```

#### JavaScript Handler:
```javascript
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    const response = await fetch(API_BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = 'shop.html';
    } else {
      alert('Login failed: ' + data.message);
    }
  } catch (error) {
    console.error('Login error:', error);
  }
});
```

### 2. Fetching Products

```javascript
async function loadProducts() {
  try {
    const response = await fetch(API_BASE_URL + '/products');
    const data = await response.json();
    displayProducts(data.products);
  } catch (error) {
    console.error('Error loading products:', error);
  }
}

function displayProducts(products) {
  const container = document.getElementById('productsContainer');
  container.innerHTML = products.map(product => `
    <div class="product-card">
      <h3>${escapeHTML(product.name)}</h3>
      <p>${escapeHTML(product.description)}</p>
      <price>₹${escapeHTML(String(product.price))}</price>
      <button onclick="addToCart('${escapeHTML(product._id)}')">Add to Cart</button>
    </div>
  `).join('');
}
```

### 3. Shopping Cart

```javascript
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(productId, quantity = 1) {
  const existingItem = cart.find(item => item.productId === productId);
  
  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ productId, quantity });
  }
  
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  document.getElementById('cartCount').textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}
```

### 4. Placing Order

```javascript
async function placeOrder() {
  const token = localStorage.getItem('token');
  
  if (!token) {
    alert('Please login first');
    window.location.href = 'login.html';
    return;
  }
  
  const orderData = {
    items: cart,
    address: getAddressFromForm(),
    paymentMethod: getSelectedPaymentMethod()
  };
  
  try {
    const response = await fetch(API_BASE_URL + '/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });
    
    const data = await response.json();
    
    if (response.ok) {
      localStorage.removeItem('cart');
      window.location.href = `tracking.html?orderId=${data.order._id}`;
    }
  } catch (error) {
    console.error('Order error:', error);
  }
}
```

### 5. Real-time Order Tracking

```javascript
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

function startTracking() {
  // Poll every 5 seconds for updates
  setInterval(async () => {
    try {
      const response = await fetch(API_BASE_URL + `/orders/track/${orderId}`);
      const data = await response.json();
      
      updateMap(data.location);
      updateStatus(data.status);
      updateETA(data.eta);
    } catch (error) {
      console.error('Tracking error:', error);
    }
  }, 5000);
}

function updateMap(location) {
  // Update map with delivery location
  // Using Google Maps API or Leaflet
}
```

## Testing

### 1. Local Testing
```bash
# Terminal 1: Start Backend
cd backend
node server.js

# Terminal 2: Serve Frontend
python -m http.server 8000

# Browser: http://localhost:8000
```

### 2. Test Scenarios
- ✅ User registration
- ✅ User login
- ✅ Browse products
- ✅ Add to cart
- ✅ Remove from cart
- ✅ Place order
- ✅ View order status
- ✅ Real-time tracking
- ✅ Payment processing

## Production Deployment

### 1. Backend Deployment to Heroku
Follow HEROKU_DEPLOYMENT_GUIDE.md

### 2. Frontend Deployment
- Frontend is automatically deployed to GitHub Pages
- Update API_BASE_URL to Heroku app URL
- Commit and push to main branch

### 3. Verification
```bash
# Test API endpoint
curl https://your-heroku-app.herokuapp.com/api/products

# Verify CORS
curl -H "Origin: https://yourusername.github.io" \
     -H "Access-Control-Request-Method: GET" \
     https://your-heroku-app.herokuapp.com/api/products
```

## Error Handling

### Common Issues

#### CORS Error
```
Access to XMLHttpRequest has been blocked by CORS policy
```
**Solution**: Update backend CORS configuration

#### 401 Unauthorized
```
Token expired or invalid
```
**Solution**: Refresh token or re-login

#### 404 Not Found
```
Cannot GET /api/products
```
**Solution**: Verify API endpoint is correct and backend is running

## Performance Tips

1. **Caching**: Cache API responses in localStorage
2. **Pagination**: Use limit and skip parameters for large datasets
3. **Compression**: Enable gzip compression on backend
4. **CDN**: Serve static files from CDN
5. **Database Indexes**: Index frequently searched fields

## Security Practices

1. **HTTPS Only**: Always use HTTPS in production
2. **Token Expiry**: Set JWT token expiration to 1 hour
3. **Rate Limiting**: Limit API requests to prevent abuse
4. **Input Validation**: Validate all user inputs on backend
5. **SQL Injection**: Use parameterized queries (MongoDB native)
6. **XSS Prevention**: Sanitize HTML content

## Monitoring

- Monitor API response times
- Track error rates
- Monitor database performance
- Track user analytics
- Set up alerts for failures

## Support

For issues, check:
1. Browser console for errors
2. Backend logs on Heroku: `heroku logs --tail`
3. Network tab in DevTools
4. GitHub Issues
