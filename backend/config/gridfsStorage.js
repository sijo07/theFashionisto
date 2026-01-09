import multer from "multer";
import { GridFsStorage } from "multer-gridfs-storage";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Fallback to memory storage if MONGO_URI is missing (Prevents server crash)
let storage;
if (process.env.MONGO_URI) {
  try {
    storage = new GridFsStorage({
      db: mongoose.connection.asPromise().then(() => mongoose.connection.db),
      file: (req, file) => {
        return {
          filename: `${Date.now()}-${file.originalname}`,
          bucketName: "uploads",
        };
      },
    });
  } catch (err) {
    console.error("GridFS Storage Init Failed:", err);
    storage = multer.memoryStorage();
  }
} else {
  console.warn("MONGO_URI missing, disabling GridFS uploads");
  storage = multer.memoryStorage();
}

// Create multer upload middleware
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if storage is valid (if we used fallback)
    if (!process.env.MONGO_URI) {
      return cb(new Error("Cannot upload: Database not configured (MONGO_URI missing)"), false);
    }

    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    cb(null, true);
  }
});

export default upload;