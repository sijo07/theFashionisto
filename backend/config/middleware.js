import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

const configureMiddleware = (app) => {
  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false, // Important if serving images/files
    })
  );

  // CORS – allow your frontend to connect
  app.use(
    cors({
      origin: process.env.CLIENT_URL || "*", // e.g., http://localhost:5173
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    })
  );

  // Rate limiting for protection
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // max requests per IP
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
  });

  app.use(limiter);
};

export default configureMiddleware;