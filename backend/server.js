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
      // Debugging info
      // console.log("Blocked Origin:", origin);
      // Allow vercel deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ---------------- Database Check Middleware ----------------
// Ensures DB is connected before processing request (Vital for Serverless Cold Starts)
app.use(async (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
      // Initialize GridFS if needed, though initGridFS logic handles its own checks
      initGridFS();
    } catch (error) {
      console.error("DB Connection Failed in Middleware:", error);
      return res.status(500).json({ error: "Database Connection Failed" });
    }
  }
  next();
});

// ---------------- Security Middleware ----------------
configureMiddleware(app);  // helmet, cors, limiter

// ---------------- Static Files ----------------
const __dirname = path.resolve();
// app.use("/uploads", express.static(path.join(__dirname, "/uploads"))); // Disabled for Vercel (Use GridFS or Cloudinary)

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
