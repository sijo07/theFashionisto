# Vercel Deployment Guide for TheFashionisto

This project is configured to be deployed as a full-stack application on Vercel.

## Prerequisite: Vercel Project Settings

1.  **Framework Preset**: Select **Vite** (for the frontend).
2.  **Root Directory**: Leave as `.` (root).
3.  **Build Command**: `npm run build` (This runs the script in `package.json`).
4.  **Output Directory**: `frontend/dist` (This is where Vite builds the frontend).
5.  **Install Command**: `npm install` (Default).

## Environment Variables

You **MUST** set the following environment variables in your Vercel Project Settings for the backend to work.

| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `MONGO_URI` | Connection string for MongoDB Atlas. | `mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key for signing JWT tokens. | `your_super_secure_secret_key` |
| `PAYPAL_CLIENT_ID` | Client ID for PayPal integration. | `AbC...` |
| `NODE_ENV` | Environment mode. | `production` |

> [!IMPORTANT]
> Ensure your MongoDB Atlas Network Access whitelist includes `0.0.0.0/0` (Allow Access from Anywhere) so Vercel can connect.

## Troubleshooting

### 500 Internal Server Error on API Calls
- Check **Function Logs** in the Vercel Dashboard -> Deployments -> [Your Deployment] -> Functions.
- Common cause: DB connection failure. Verify `MONGO_URI`.
- Common cause: Missing dependencies. Ensure `package.json` is correct and no devDependencies are required at runtime.

### Frontend 404 on Refresh
- The `vercel.json` file handles rewrites.
- It directs `/api/` requests to the backend.
- It directs all other requests to `frontend/dist/index.html` (SPA fallback).

## Local Testing
To test the build locally before deploying:
```bash
npm run build
npm start
```
