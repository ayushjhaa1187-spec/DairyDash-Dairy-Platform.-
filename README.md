# 🥛 DairyDash - Quick Commerce Dairy Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16.x-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express.js-4.x-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-brightgreen.svg)](https://www.mongodb.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

**Enterprise-Ready Quick Commerce Platform for Fresh Dairy Products** — Delivering farm-fresh dairy to your doorstep in 10-15 minutes.

DairyDash is a comprehensive e-commerce ecosystem built to handle rapid hyperlocal deliveries. It combines a responsive customer-facing frontend with a robust Express/MongoDB backend, featuring real-time tracking, multiple payment gateways, and automated notifications.

---

## 📸 Demo / Screenshots

| Home | Products | Cart |
|------|----------|------|
| ![Home](https://via.placeholder.com/300x400.png?text=Home+Screen) | ![Products](https://via.placeholder.com/300x400.png?text=Products+Screen) | ![Cart](https://via.placeholder.com/300x400.png?text=Cart+Screen) |

*(Note: Replace placeholder images with actual screenshots from the `screenshots/` directory if available.)*

---

## ✨ Features

### Customer Experience
- 🛒 **Real-Time Inventory:** Live stock updates directly from connected dairy farms.
- ⚡ **10-15 Min Delivery:** Hyperlocal delivery network targeting a 3km radius.
- 📍 **Live Order Tracking:** Real-time GPS tracking of deliveries via Google Maps integration.
- 💳 **Flexible Payments:** Integration with Razorpay and Stripe for UPI, Cards, and Wallets.
- 🔔 **Smart Notifications:** SMS (Twilio), WhatsApp, and Push Notifications (Firebase).

### Vendor & Admin Tools
- 📊 **Analytics Dashboard:** Insights into sales, revenue, and customer behaviors.
- 📦 **Inventory & Delivery Management:** Real-time stock tracking, route optimization, and partner allocation.
- 🎯 **Marketing:** Campaign management, promo codes, and dynamic peak/off-peak pricing.

### Technical Highlights
- 🔐 **Secure Authentication:** JWT-based user sessions with bcrypt password hashing.
- 🛡️ **Robust Security:** Built-in rate limiting, Helmet.js secure headers, and rigorous input validation (express-validator).
- 🗄️ **Optimized Database:** Highly optimized MongoDB queries with indexing and lean document retrieval.

---

## 🛠️ Tech Stack

**Frontend**
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS

**Backend**
- Node.js & Express.js
- MongoDB & Mongoose
- JSON Web Tokens (JWT) & bcryptjs

**Integrations & Services**
- **Payments:** Razorpay, Stripe
- **Notifications & Tracking:** Twilio, Firebase Admin, Nodemailer, Google Maps API
- **File Uploads:** Multer

---

## 📁 Project Structure

```text
DairyDash/
├── backend/                  # Node.js backend application
│   ├── config.js             # Centralized configuration and defaults
│   ├── models/               # Mongoose schemas (User, Product, Order, etc.)
│   ├── routes/               # Express route handlers
│   ├── package.json          # Backend dependencies and scripts
│   ├── Procfile              # Deployment configuration
│   └── server.js             # Application entry point
├── *.html                    # Modular frontend views (index, shop, cart, tracking, etc.)
├── script.js                 # Core frontend JavaScript logic
└── style.css                 # Global stylesheets
```

---

## ⚙️ Prerequisites

Ensure you have the following installed on your local machine:
- **Node.js** (v16.x or higher)
- **MongoDB** (v5.x or higher)
- **Git**

---

## 🚀 Installation & Setup

**1. Clone the repository**
```bash
git clone https://github.com/ayushjhaa1187-spec/DairyDash.git
cd DairyDash
```

**2. Install Backend Dependencies**
```bash
cd backend
npm install
```

**3. Configure Environment Variables**
```bash
# Create a .env file based on the config.js requirements
touch .env
```
*(Populate the `.env` file with the required variables listed in the [Environment Variables](#-environment-variables) section).*

**4. Start the Application**
```bash
# Start the backend server in development mode
cd backend
npm run dev &
```

---

## 💻 Usage

To run the application locally:

**Backend Server:**
```bash
cd backend
npm run dev &
# The API will be available at http://localhost:5000/api
```

**Frontend:**
Serve the root directory using any static file server. For example, using `npx serve`:
```bash
# From the project root
npx serve .
# Access the frontend at http://localhost:3000
```

---

## 🔐 Environment Variables

Create a `.env` file in the `backend/` directory. The application requires the following variables:

| Variable | Description | Example |
|---|---|---|
| `PORT` | API Server Port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `MONGODB_URI` | MongoDB Connection String | `mongodb://localhost:27017/dairydash` |
| `JWT_SECRET` | Secret key for signing JWTs | `super-secret-key-32-chars-min` |
| `EMAIL_SERVICE` | Email provider for Nodemailer | `gmail` |
| `EMAIL_USER` | Email address for sending OTPs/receipts | `no-reply@dairydash.com` |
| `EMAIL_PASSWORD` | App password for the email service | `your-app-password` |
| `RAZORPAY_KEY` | Razorpay API Key | `rzp_test_xxxxxxx` |
| `RAZORPAY_SECRET` | Razorpay API Secret | `secret_xxxxxxx` |
| `GOOGLE_MAPS_KEY` | Google Maps API Key for tracking | `AIzaSy...` |
| `TWILIO_ACCOUNT_SID`| Twilio Account SID | `ACxxxxxx...` |
| `TWILIO_AUTH_TOKEN` | Twilio Auth Token | `xxxxxx...` |
| `TWILIO_PHONE` | Twilio Sender Phone Number | `+1234567890` |
| `FIREBASE_API_KEY` | Firebase API Key | `AIzaSy...` |
| `FIREBASE_PROJECT_ID`| Firebase Project ID | `dairydash-12345` |

---

## 📡 API Reference

Here are the core REST API endpoints available in the backend:

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user account |
| `POST` | `/api/auth/login` | Authenticate user and return JWT |

### Products
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/products` | Retrieve all available products |
| `GET` | `/api/products/:id` | Get details of a specific product |
| `GET` | `/api/products/category/:category`| Fetch products by category |

### Orders & Tracking
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/orders` | Create a new order |
| `GET` | `/api/orders/:id` | Fetch details of a specific order |
| `GET` | `/api/orders/:id/track` | Track live order delivery status |
| `PUT` | `/api/orders/:id/cancel`| Cancel an existing order |

---

## 🎛️ Configuration

Advanced application settings can be tweaked in `backend/config.js`. Key configuration options include:

- **CORS Configuration:** Define allowed origins (`CORS_ORIGIN`) for production and development.
- **Rate Limiting:** Modify `RATE_LIMIT_WINDOW` (default: 15 mins) and `RATE_LIMIT_MAX_REQUESTS` (default: 100).
- **Session Timeout:** Adjust `SESSION_TIMEOUT` (default: 1 hour).
- **Pagination Defaults:** Set `DEFAULT_PAGE` and `DEFAULT_LIMIT` for list endpoints.

---

## 🤝 Contributing

Contributions are always welcome! To contribute:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature/your-feature-name`.
5. Open a Pull Request detailing your changes.

Please ensure all tests pass and your code adheres to the existing style.

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for more details.

---

## 🙏 Acknowledgements

- **Author:** [Ayush Kumar Jha](https://github.com/ayushjhaa1187-spec)
- Special thanks to the open-source communities behind Express, MongoDB, Tailwind CSS, Razorpay, Twilio, and Firebase.
- Built with ❤️ for the Indian dairy industry.
