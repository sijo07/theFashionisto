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
  },
  { timestamps: true }
);

const productSchema = mongoose.Schema(
  {
    image: { type: String, required: true },
    brand: {
      type: String,
      required: [true, "Please Enter Product Brand"],
    },
    quantity: { type: Number, required: true },
    category: {
      type: ObjectId,
      ref: "Category",
      required: [true, "Please Select Product Category"],
    },
    subCategory: {
      type: ObjectId,
      ref: "Category",
      required: [true, "Please Select Sub-Category"],
    },
    description: {
      type: String,
      required: [true, "Please Enter Product Description"],
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: { type: Number, required: true, default: 0 },
    price: {
      type: Number,
      required: [true, "Please Enter Product Price"],
      maxLength: [8, "Price cannot exceed 8 characters"],
      default: 0,
    },
    cutPrice: {
      type: Number,
      required: true,
      default: 0,
    },
    countInStock: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);
export default Product;
