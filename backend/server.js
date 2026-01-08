import path from "path";
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";
import configureMiddleware from "./config/middleware.js";
import errorHandler from "./middlewares/errorHandler.js";
import rateLimiter from "./middlewares/rateLimiter.js";
import { initGridFS } from "./config/gridfs.js";

import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const port = process.env.PORT || 5000;

console.log(`Starting server with PORT: ${port}`); // Trigger Restart

// ---------------- Connect to Database ----------------
connectDB().then(async () => {
  const app = express();

  // Initialize GridFS after DB connection
  initGridFS();

  // ---------------- Core Middleware ----------------
  app.use(cors({
    origin: process.env.CLIENT_URL || "*", // e.g., http://localhost:5173
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

  // Import upload routes *after DB connection*
  const uploadRoutes = (await import("./routes/uploadRoutes.js")).default;
  app.use("/api/upload", uploadRoutes);


  app.use("/api/products", productRoutes);
  app.use("/api/category", categoryRoutes);
  app.use("/api/orders", orderRoutes);

  app.get("/api/config/paypal", (req, res) => {
    res.send({ clientId: process.env.PAYPAL_CLIENT_ID });
  });

  // ---------------- Global Error Handler ----------------
  app.use(errorHandler);

  // ---------------- Start Server ----------------
  const server = app.listen(port, () => {
    console.log(`🚀 Server running on port: ${port}`);
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
  });
});