// Member 1 — Product routes
const express = require("express");
const router = express.Router();
const {
  getProducts,
  searchProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

router.get("/search", searchProducts); // must come before /:id
router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

module.exports = router;
