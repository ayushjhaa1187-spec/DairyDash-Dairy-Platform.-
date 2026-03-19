# Deploy DairyDash on Vercel

## 1. Prerequisites
- A Vercel account (https://vercel.com/)
- A MongoDB Atlas account (https://www.mongodb.com/cloud/atlas) or any MongoDB URI.
- Git installed.

## 2. Setup
1.  **Clone the repository** (if you haven't already).
2.  **Install backend dependencies**:
    ```bash
    cd backend
    npm install
    ```

## 3. Environment Variables
You need to set the following environment variables in your Vercel project settings:

- `MONGODB_URI`: Your MongoDB connection string.
- `JWT_SECRET`: A secret string for JWT signing (e.g., generated via `openssl rand -base64 32`).
- `NODE_ENV`: Set to `production`.

## 4. Deploy to Vercel
You can deploy using the Vercel CLI or via the Vercel Dashboard.

### Option A: Vercel CLI
1.  Install Vercel CLI: `npm i -g vercel`
2.  Run `vercel` in the root directory.
3.  Follow the prompts.

### Option B: Vercel Dashboard (Git Integration)
1.  Push your code to GitHub/GitLab/Bitbucket.
2.  Import the project in Vercel.
3.  **Root Directory**: Leave as `./`.
4.  **Framework Preset**: Select `Other` (or Vercel will auto-detect).
5.  **Build Command**: Leave empty or custom if needed.
6.  **Output Directory**: `.` (default).
7.  **Environment Variables**: Add the variables from Step 3.
8.  Click **Deploy**.

## 5. Troubleshooting
- If the backend fails (500 error), check the Function Logs in Vercel Dashboard.
- Ensure your MongoDB IP Whitelist includes `0.0.0.0/0` (Allow Access from Anywhere) since Vercel IPs change dynamically.
