import mongoose from "mongoose";
const { ObjectId } = mongoose.Schema;

const reviewSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    isVerifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    image: {
      type: String,
      required: true
    },
    productId: {
      type: String,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Please enter product name"],
      trim: true,
      maxLength: [100, "Product name cannot exceed 100 characters"],
    },
    brand: {
      type: String,
      required: [true, "Please enter product brand"],
    },
    price: { type: Number, required: true, default: 0 },
    offer: { type: Number, required: true, default: 0 },
    isFeatured: { type: Boolean, default: false },
    quantity: { type: Number, required: true },
    category: {
      type: ObjectId,
      ref: "Category",
      required: [true, "Please select product category"],
    },
    description: {
      type: String,
      required: [true, "Please enter product description"],
    },
    sizes: [
      {
        size: { type: String, required: true },
        stock: { type: Number, required: true, default: 0 },
      }
    ],
    // Total stock derived from sizes, helpful for quick sorting/filtering
    countInStock: { type: Number, required: true, default: 0 },
    reviews: [reviewSchema],
    rating: { type: Number, required: true, default: 0 },
    numReviews: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;