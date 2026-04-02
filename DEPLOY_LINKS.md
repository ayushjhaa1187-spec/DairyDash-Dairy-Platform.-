# DairyDash Deployment Guide

## 1. Backend (Vercel)

This project is configured for Vercel.

1.  Push this repository to GitHub.
2.  Login to [Vercel](https://vercel.com) and "Add New Project".
3.  Import the repository.
4.  **Configuration**:
    - **Framework Preset**: Other
    - **Root Directory**: `./` (Root)
    - **Environment Variables**:
        - `MONGODB_URI`: Your MongoDB Atlas connection string.
        - `JWT_SECRET`: A random secret key.
5.  Deploy.
6.  Copy the **Domain** (e.g., `https://dairydash-backend.vercel.app`).
7.  Update `script.js` line 20 with this URL:
    ```javascript
    const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000/api' : 'https://YOUR-VERCEL-APP.vercel.app/api';
    ```

## 2. Frontend (GitHub Pages)

1.  Go to your repository **Settings** > **Pages**.
2.  Select **Source**: `Deploy from a branch`.
3.  Select **Branch**: `main`.
4.  Click **Save**.
5.  Your site will be live at `https://yourusername.github.io/repo-name`.

## 3. Database (MongoDB Atlas)

1.  Create a cluster on [MongoDB Atlas](https://www.mongodb.com/atlas).
2.  Create a database named `dairydash`.
3.  Get the connection string (ensure you whitelist Vercel IP or use `0.0.0.0/0` for testing).
