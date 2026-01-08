import express from "express";
import upload from "../config/gridfsStorage.js";
import { gridfsBucket } from "../config/gridfs.js";
import mongoose from "mongoose";

const router = express.Router();

/* -------------------- UPLOAD FILE -------------------- */
router.post("/", (req, res, next) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(400).json({ message: err.message || "File upload failed" });
    }
    next();
  });
}, (req, res) => {
  // Changed from "file" to "image" to match frontend
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.status(200).json({
    message: "File uploaded successfully",
    id: req.file.id,
    filename: req.file.filename,
    url: `/api/upload/${req.file.id}`,
  });
});

/* -------------------- GET / DOWNLOAD FILE -------------------- */
router.get("/:id", async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid file ID format" });
    }

    // Use native driver to find file metadata
    const filesCollection = mongoose.connection.db.collection('uploads.files');
    const file = await filesCollection.findOne({ _id: new mongoose.Types.ObjectId(req.params.id) });

    if (!file) return res.status(404).json({ message: "File not found" });

    // Set proper content type
    res.set('Content-Type', file.contentType);
    res.set('Content-Disposition', `inline; filename="${file.filename}"`);

    const readStream = gridfsBucket.openDownloadStream(file._id);
    readStream.on('error', (err) => {
      res.status(500).json({ message: "Error streaming file" });
    });
    readStream.pipe(res);
  } catch (err) {
    console.error("Error retrieving file:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* -------------------- DELETE FILE -------------------- */
router.delete("/:id", async (req, res) => {
  try {
    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid file ID format" });
    }

    await gridfsBucket.delete(new mongoose.Types.ObjectId(req.params.id));
    res.json({ message: "File deleted successfully" });
  } catch (err) {
    console.error("Error deleting file:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;