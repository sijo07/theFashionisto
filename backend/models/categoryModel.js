import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: true,
    maxLength: 32,
    // unique: true, // Removed global uniqueness
  },
  categoryId: {
    type: String,
    unique: true,
  },
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  isMainCategory: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

// Index for better query performance
categorySchema.index({ parent: 1 });
categorySchema.index({ isMainCategory: 1 });
// Compound index: Name must be unique only within the same parent
categorySchema.index({ name: 1, parent: 1 }, { unique: true });

export default mongoose.model("Category", categorySchema);