import express from "express";
const router = express.Router();

import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
} from "../controllers/categoryController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Create a new category
router.post("/", authenticate, authorizeAdmin, createCategory);

// Update an existing category
router.put("/:categoryId", authenticate, authorizeAdmin, updateCategory);

// Delete a category
router.delete("/:categoryId", authenticate, authorizeAdmin, removeCategory);

// List all categories
router.route("/categories").get(listCategory);


// Read a single category by ID
router.get("/:id", readCategory);

export default router;
