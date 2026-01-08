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

  // Security headers
  app.use(
    helmet({
      crossOriginResourcePolicy: false, // Important if serving images/files
    })
  );

  // CORS is handled in server.js for better control over Vercel/Production environments

  // Rate limiting for protection
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10000, // max requests per IP
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,
  });

  app.use(limiter);
};

export default configureMiddleware;