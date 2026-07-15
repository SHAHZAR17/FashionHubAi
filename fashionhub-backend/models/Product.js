// Member 1 — Product schema
// Field names match the mock product data (productName, category, price,
// sizes, colors, stockCount) plus the extra fields the project brief asks for.
const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      enum: ["Women's Collection", "Men's Collection", "Kids Collection"],
    },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    sizes: { type: [String], default: [] },
    colors: { type: [String], default: [] },
    stockCount: { type: Number, required: true, min: 0, default: 0 },
    images: { type: [String], default: [] },
    discount: { type: Number, default: 0 }, // percentage
    rating: { type: Number, default: 0, min: 0, max: 5 },
  },
  { timestamps: true }
);

// Basic text index so /api/products/search can do free-text queries
// like "black dress for Eid"
productSchema.index({
  productName: "text",
  description: "text",
  category: "text",
  colors: "text",
});

module.exports = mongoose.model("Product", productSchema);
