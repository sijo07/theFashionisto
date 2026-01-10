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
const port = process.env.PORT || 3004;

// ---------------- Initialize App ----------------
const app = express();

// ---------------- Database Connection ----------------
// We call it but don't await at top level for serverless cold-start efficiency
// connectDB() handles its own internal checks or connection pooling via mongoose
connectDB().then(() => {
  try {
    initGridFS();
  } catch (err) {
    console.error("GridFS Init Failed (Non-fatal):", err);
  }
}).catch(err => {
  console.error("Initial DB Connection Promise Failed:", err);
});

// ---------------- Core Middleware ----------------
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      process.env.CLIENT_URL,
      "http://localhost:8004",
      "https://thefashionisto.vercel.app" // Add your production URL here
    ].filter(Boolean);

    if (allowedOrigins.includes(origin) || !origin || origin.endsWith(".vercel.app") || origin.endsWith(".onrender.com")) {
      callback(null, true);
    } else {
      console.warn(`CORS Blocked Origin: ${origin}`); // Log blocked origins
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
      try { initGridFS(); } catch (e) { console.error("GridFS Lazy Init Failed:", e); }
    } catch (error) {
      console.error("DB Connection Failed in Middleware:", error);
      return res.status(500).json({
        error: "Database Connection Failed",
        details: error.message, // process.env.NODE_ENV === "production" ? "Check Server Logs" : error.message,
        hint: "Check MONGO_URI"
      });
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
  try {
    res.json({
      status: "debug",
      env: {
        MONGO_URI: process.env.MONGO_URI ? "Defined" : "MISSING",
        JWT_SECRET: process.env.JWT_SECRET ? "Defined" : "MISSING",
        NODE_ENV: process.env.NODE_ENV,
        PORT: process.env.PORT,
      },
      db: {
        state: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
        host: mongoose.connection.host,
      },
      time: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message, stack: error.stack });
  }
});

// ---------------- Global Error Handler ----------------
app.use(errorHandler);

// ---------------- Start Server (Local Only) ----------------
// ---------------- Start Server ----------------
app.listen(port, "0.0.0.0", () => {
  console.log(`🚀 Server running on port: ${port}`);
});

export default app;
