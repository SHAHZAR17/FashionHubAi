// Member 1 — Product controller
const Product = require("../models/Product");

// GET /api/products?category=&minPrice=&maxPrice=&color=&size=
exports.getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, color, size } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (color) filter.colors = { $in: [new RegExp(`^${color}$`, "i")] };
    if (size) filter.sizes = { $in: [new RegExp(`^${size}$`, "i")] };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/search?q=black dress for eid
// Free-text search used by the AI recommendation flow
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ error: "Query param 'q' is required" });

    const products = await Product.find(
      { $text: { $search: q } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(5);

    res.json({ count: products.length, products });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/products/:id
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/products  (admin)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/products/:id  (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/products/:id  (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Internal helper used by Member 2's order flow to decrement stock
exports.decrementStock = async (productId, quantity) => {
  const product = await Product.findById(productId);
  if (!product) throw new Error("Product not found");
  if (product.stockCount < quantity) throw new Error("Insufficient stock");
  product.stockCount -= quantity;
  await product.save();
  return product;
};
