import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { generateId } from "../utils/idGenerator.js";

const createCategory = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  // Check if category already exists under the same parent
  const existingCategory = await Category.findOne({ name, parent: parent || null });
  if (existingCategory) {
    return res.status(409).json({ error: "Category already exists" });
  }

  let prefix, seqName;
  // Level 0 (Super) | Level 1 (Main) | Level 2 (Sub)

  if (!parent) {
    // Level 0: Super Category
    prefix = "FSG";
    seqName = "superCategory";
  } else {
    const parentCat = await Category.findById(parent);
    if (!parentCat) {
      return res.status(404).json({ error: "Parent category not found" });
    }

    // Determine level based on parent's ID prefix
    const parentPrefix = parentCat.categoryId ? parentCat.categoryId.substring(0, 3) : "";

    if (parentPrefix === "FSG") {
      // Parent is Super -> Create Main (Level 1)
      prefix = "FSC";
      seqName = "mainCategory";
    } else if (parentPrefix === "FSC") {
      // Parent is Main -> Create Sub (Level 2)
      prefix = "FSK";
      seqName = "subCategory";
    } else {
      return res.status(400).json({ error: "Maximum category depth reached or invalid parent." });
    }
  }

  const categoryId = await generateId(prefix, seqName);

  const category = new Category({
    name,
    parent: parent || null,
    // For compatibility, isMainCategory is true if it's a root (Super)
    isMainCategory: !parent,
    categoryId
  });

  const savedCategory = await category.save();
  res.status(201).json(savedCategory);
});

const updateCategory = asyncHandler(async (req, res) => {
  const { name, parent } = req.body;
  const { categoryId } = req.params;

  const category = await Category.findById(categoryId);
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }

  // Update fields if provided
  if (name) category.name = name;
  if (parent !== undefined) {
    category.parent = parent || null;
    category.isMainCategory = !parent;
  }

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

const removeCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  // Check if this category has subcategories
  const hasSubcategories = await Category.findOne({ parent: categoryId });
  if (hasSubcategories) {
    return res.status(400).json({
      error: "Cannot delete category with subcategories. Delete subcategories first."
    });
  }

  const removed = await Category.findByIdAndRemove(categoryId);
  if (!removed) {
    return res.status(404).json({ error: "Category not found" });
  }

  res.json({ message: "Category removed successfully", category: removed });
});

const listCategory = asyncHandler(async (req, res) => {
  const all = await Category.find({}).sort({ name: 1 });

  res.json(all);
});

const readCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ error: "Category not found" });
  }
  res.json(category);
});

// Get subcategories for a specific main category
const getSubcategories = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;

  const subcategories = await Category.find({
    parent: categoryId,
    isMainCategory: false
  }).sort({ name: 1 });

  res.json(subcategories);
});

// Get all categories in a hierarchical structure
const listCategoriesHierarchical = asyncHandler(async (req, res) => {
  // Get all main categories
  const mainCategories = await Category.find({ isMainCategory: true }).sort({ name: 1 });

  // Get all subcategories
  const allSubCategories = await Category.find({
    isMainCategory: false,
    parent: { $ne: null }
  }).sort({ name: 1 });

  // Build hierarchical structure
  const hierarchicalCategories = mainCategories.map(mainCat => {
    const subcategories = allSubCategories.filter(subCat =>
      subCat.parent && subCat.parent.toString() === mainCat._id.toString()
    );

    return {
      ...mainCat.toObject(),
      subcategories
    };
  });

  res.json(hierarchicalCategories);
});

export {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  readCategory,
  getSubcategories,
  listCategoriesHierarchical
};