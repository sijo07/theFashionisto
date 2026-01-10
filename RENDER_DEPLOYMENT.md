# Deploying to Render (Recommended Alternative)

If Vercel's serverless environment is causing too many headaches with database connections or build configurations, **Render** is the best alternative. It runs your backend as a real server (not serverless), which is much more stable for this type of application.

## Why Render?
-   **Native Node.js Support**: exact same environment as your local machine.
-   **No Cold Starts (on paid plans)**: Faster response times.
-   **Easier Configuration**: Auto-detects settings.
-   **Free Tier Available**.

## Step 1: Deploy Backend (Web Service)

1.  **Sign up** at [render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your **GitHub Repository**.
4.  **Settings**:
    -   **Name**: `thefashionisto-backend`
    -   **Region**: Closest to you (e.g., Singapore/Oregon).
    -   **Branch**: `main`
    -   **Root Directory**: `.` (Leave empty).
    -   **Runtime**: `Node`.
    -   **Build Command**: `npm install`
    -   **Start Command**: `npm start` (This uses `node backend/server.js`).
5.  **Environment Variables** (Advanced -> Add Environment Variable):
    -   `MONGO_URI`: Your MongoDB Connection String.
    -   `JWT_SECRET`: Your secret.
    -   `NODE_ENV`: `production`.
    -   `PORT`: `10000` (Render sets this automatically, but good to double-check).
6.  Click **Create Web Service**.
    -   *Wait for it to go live. You will get a URL like `https://thefashionisto-backend.onrender.com`.*

## Step 2: Deploy Frontend (Static Site)

1.  Click **New +** -> **Static Site**.
2.  Connect the **same repository**.
3.  **Settings**:
    -   **Name**: `thefashionisto-frontend`
    -   **Branch**: `main`
    -   **Root Directory**: `frontend` (Important!).
    -   **Build Command**: `npm install && npm run build`
    -   **Publish Directory**: `dist`
4.  **Environment Variables**:
    -   `VITE_BACKEND_URL`: `https://thefashionisto-backend.onrender.com` (The URL from Step 1).
5.  Click **Create Static Site**.

## Step 3: Update Code

You still need to make sure your Frontend knows about the Backend URL.

**Update `frontend/src/redux/constants.js`:**
```javascript
export const BASE_URL = import.meta.env.VITE_BACKEND_URL || "";
```

**Update `backend/server.js`:**
Add your Render Frontend URL to the `allowedOrigins` list for CORS.
