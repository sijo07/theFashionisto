import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";

import connectDB from "./config/db.js";
import configureMiddleware from "./config/middleware.js";
import errorHandler from "./middlewares/errorHandler.js";
import { initGridFS } from "./config/gridfs.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();
const port = process.env.PORT || 5000;

// ---------------- Initialize App ----------------
const app = express();

// ---------------- Database Connection ----------------
// We call it but don't await at top level for serverless cold-start efficiency
// connectDB() handles its own internal checks or connection pooling via mongoose
connectDB().then(() => {
  initGridFS();
});

// ---------------- Core Middleware ----------------
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // During development or if CLIENT_URL is not set, we might want to be permissive
    // But for production with credentials: true, we must return the specific origin, not unique "*"
    const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";

    if (origin === allowedOrigin || origin === "http://localhost:5173") {
      callback(null, true);
    } else {
      // For debugging Vercel issues, we can log this mismatch
      console.log(`CORS: Origin ${origin} not explicitly allowed. Expected: ${allowedOrigin}`);
      // Fallback: If we really want to allow it (e.g. preview deployments), we could echo it back
      // But for security, let's stick to the env var. 
      // Failsafe: Just allow it for now to get it working? No, strict is better for cookies.
      // Let's allow if it matches the Vercel app pattern?
      if (origin.endsWith(".vercel.app")) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------- Security Middleware ----------------
configureMiddleware(app);  // helmet, cors, limiter

// ---------------- Static Files ----------------
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// ---------------- API Routes ----------------
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/products", productRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/orders", orderRoutes);

app.get("/api/config/paypal", (req, res) => {
  res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
});

app.get("/", (req, res) => {
  res.send("API is running...");
});

app.get("/api/test", (req, res) => {
  res.json({ status: "ok", message: "Backend is reachable" });
});

app.get("/api/debug", (req, res) => {
  res.json({
    status: "debug",
    mongoUriConfigured: !!process.env.MONGO_URI,
    mongoUriPrefix: process.env.MONGO_URI ? process.env.MONGO_URI.substring(0, 15) + "..." : "MISSING",
    dbState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
    time: new Date().toISOString()
  });
});

// ---------------- Global Error Handler ----------------
app.use(errorHandler);

// ---------------- Start Server (Local Only) ----------------
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server running on port: ${port}`);
  });
}

export default app;
