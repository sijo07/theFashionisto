import asyncHandler from "express-async-handler";
import Product from "../models/productModel.js";
import formidable from "formidable";
import { generateId } from "../utils/idGenerator.js";

// Add Product
const addProduct = asyncHandler(async (req, res) => {
  try {
    const { name, brand, description, price, offer, category, sizes, quantity, image, isFeatured } =
      req.fields;

    // Validation
    if (!name) return res.status(400).json({ error: "Name is required" });
    if (!brand) return res.status(400).json({ error: "Brand is required" });
    if (!description) return res.status(400).json({ error: "Description is required" });
    if (!price) return res.status(400).json({ error: "Price is required" });
    if (!category) return res.status(400).json({ error: "Category is required" });
    if (!sizes) return res.status(400).json({ error: "Sizes are required" });

    // Parse sizes
    let parsedSizes = sizes;
    if (typeof sizes === 'string') {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        return res.status(400).json({ error: "Invalid sizes format" });
      }
    }

    if (!Array.isArray(parsedSizes) || parsedSizes.length === 0) {
      return res.status(400).json({ error: "At least one size with stock is required" });
    }

    // Calculate total stock
    const countInStock = parsedSizes.reduce((acc, item) => acc + Number(item.stock), 0);

    // Parse image
    let imageData = image;
    if (typeof image === 'string' && image.startsWith('{')) {
      try {
        imageData = JSON.parse(image);
      } catch (parseError) {
        console.error("Error parsing image data:", parseError);
      }
    }
    const imageUrl = imageData?.url || imageData;

    const productId = await generateId("FSP", "product");

    const product = new Product({
      productId,
      name,
      brand,
      description,
      price,
      offer,
      category,
      sizes: parsedSizes,
      countInStock,
      quantity,
      image: imageUrl,
      isFeatured: isFeatured === 'true' || isFeatured === true,
    });

    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

// Update product
const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const { name, brand, description, price, offer, category, sizes, quantity, image, isFeatured } =
      req.fields;

    // Validation (Relaxed for partial updates)
    // if (!name) return res.status(400).json({ error: "Name is required" });
    // ... we rely on existing data or frontend validation for critical edits.

    // Parse sizes
    let parsedSizes = sizes;
    if (typeof sizes === 'string') {
      try {
        parsedSizes = JSON.parse(sizes);
      } catch (e) {
        return res.status(400).json({ error: "Invalid sizes format" });
      }
    }

    const countInStock = Array.isArray(parsedSizes)
      ? parsedSizes.reduce((acc, item) => acc + Number(item.stock), 0)
      : 0;

    // Parse image
    let imageUrl = image;
    if (typeof image === 'string' && image.startsWith('{')) {
      try {
        const parsed = JSON.parse(image);
        imageUrl = parsed.url || parsed;
      } catch (err) { }
    } else if (typeof image === 'object' && image?.url) {
      imageUrl = image.url;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.fields,
        image: imageUrl, // Ensure image is string URL
        sizes: parsedSizes,
        countInStock,
        isFeatured: isFeatured === 'true' || isFeatured === true,
      },
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;

    const keyword = req.query.keyword
      ? {
        brand: {
          $regex: req.query.keyword,
          $options: "i",
        },
      }
      : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
      .populate({
        path: "category",
        select: "name parent",
        populate: { path: "parent", select: "name" }
      })
      .limit(pageSize);

    res.json({
      products,
      page: 1,
      pages: Math.ceil(count / pageSize),
      hasMore: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const fetchProductById = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name parent isMainCategory');
    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Product not found" });
  }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .populate("category", "name parent isMainCategory")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        res.status(400);
        throw new Error("Product already reviewed");
      }

      // Check if user has purchased this product
      const Order = (await import("../models/orderModel.js")).default;
      const orders = await Order.find({
        user: req.user._id,
        isPaid: true,
        "orderItems.product": req.params.id,
      });

      const review = {
        name: req.user.username,
        rating: Number(rating),
        comment,
        user: req.user._id,
        isVerifiedPurchase: orders.length > 0,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({})
      .sort({ rating: -1 })
      .limit(4)
      .populate({
        path: "reviews.user",
        select: "image username",
      });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find().sort({ _id: -1 }).limit(5);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio } = req.body;

    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    // Size filter temporarily removed or needs update to query 'sizes.size'
    // if (req.body.size) args['sizes.size'] = req.body.size; 

    const products = await Product.find(args).populate({
      path: "category",
      select: "name parent",
      populate: { path: "parent", select: "name" }
    });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});

const deleteProductReview = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      const reviewIndex = product.reviews.findIndex(
        (r) => r._id.toString() === req.params.reviewId
      );

      if (reviewIndex === -1) {
        res.status(404);
        throw new Error("Review not found");
      }

      const review = product.reviews[reviewIndex];

      // Check permissions: Admin or Owner
      // Note: req.user is set by authenticate middleware
      if (req.user.isAdmin || review.user.toString() === req.user._id.toString()) {
        product.reviews.splice(reviewIndex, 1);

        product.numReviews = product.reviews.length;
        if (product.numReviews > 0) {
          product.rating =
            product.reviews.reduce((acc, item) => item.rating + acc, 0) /
            product.reviews.length;
        } else {
          product.rating = 0;
        }

        await product.save();
        res.status(200).json({ message: "Review deleted successfully" });
      } else {
        res.status(401);
        throw new Error("Not authorized to delete this review");
      }
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
});

export {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchProductById,
  fetchAllProducts,
  addProductReview,
  deleteProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
};