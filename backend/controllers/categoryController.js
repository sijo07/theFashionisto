import Category from "../models/categoryModel.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import slugify from "slugify";

// Helper function to format categories
function createCategories(categories, parentId = null) {
  const categoryList = [];

  let category;
  if (parentId === null) {
    category = categories.filter(
      (cat) => cat.parentId === undefined || cat.parentId === null
    );
  } else {
    category = categories.filter(
      (cat) => cat.parentId && cat.parentId.toString() === parentId.toString()
    );
  }

  for (let cate of category) {
    categoryList.push({
      _id: cate._id,
      name: cate.name,
      slug: cate.slug,
      children: createCategories(categories, cate._id),
    });
  }

  return categoryList;
}

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
  try {
    const { name, parentId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Name is required" });
    }

    const existingCategory = await Category.findOne({
      slug: slugify(name, { lower: true, strict: true }),
    });

    if (existingCategory) {
      return res
        .status(400)
        .json({ error: "Category with this name already exists" });
    }

    const category = new Category({
      name,
      slug: slugify(name, { lower: true, strict: true }),
      parentId: parentId || null,
    });

    await category.save();

    res.status(201).json(category);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// List all categories
const listCategory = asyncHandler(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const allCategories = await Category.find()
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const formattedCategories = createCategories(allCategories);

    res.json(formattedCategories);
  } catch (error) {
    console.error("Error listing categories:", error);
    res.status(400).json({ error: error.message });
  }
});

// Read a single category by ID
const readCategory = asyncHandler(async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.json(category);
  } catch (error) {
    console.error("Error reading category:", error);
    res.status(400).json({ error: error.message });
  }
});

// Update an existing category
const updateCategory = asyncHandler(async (req, res) => {
  try {
    const { name } = req.body;
    const { categoryId } = req.params;

    const category = await Category.findOne({ _id: categoryId });

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    category.name = name;
    category.slug = slugify(name, { lower: true, strict: true });

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Remove a category
const removeCategory = asyncHandler(async (req, res) => {
  try {
    const { categoryId } = req.params;

    if (!categoryId) {
      return res.status(400).json({ error: "Category ID is required" });
    }

    const removedCategory = await Category.findByIdAndDelete(categoryId);
    if (!removedCategory) {
      return res.status(404).json({ error: "Category not found" });
    }

    await Category.deleteMany({ parentId: categoryId });

    res.json({
      message: "Category successfully removed",
      removed: removedCategory,
    });
  } catch (error) {
    console.error("Error removing category:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export {
  createCategory,
  listCategory,
  readCategory,
  updateCategory,
  removeCategory,
};
