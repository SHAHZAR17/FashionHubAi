// Member 2 — Order controller
const crypto = require("crypto");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Product = require("../models/Product");
const { decrementStock } = require("./productController");

function generateTrackingNumber() {
  return "FH-" + crypto.randomBytes(4).toString("hex").toUpperCase();
}

// POST /api/orders
// body: { customerId, deliveryAddress, items: [{ productId, quantity, size, color }] }
exports.createOrder = async (req, res) => {
  try {
    const { customerId, deliveryAddress, items } = req.body;

    if (!customerId || !deliveryAddress || !items?.length) {
      return res.status(400).json({ error: "customerId, deliveryAddress and items are required" });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ error: "Customer not found" });

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ error: `Product ${item.productId} not found` });

      await decrementStock(product._id, item.quantity);

      const lineTotal = product.price * item.quantity;
      totalAmount += lineTotal;

      orderItems.push({
        product: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price: product.price,
        size: item.size || "",
        color: item.color || "",
      });
    }

    const order = await Order.create({
      trackingNumber: generateTrackingNumber(),
      customer: customer._id,
      products: orderItems,
      totalAmount,
      deliveryAddress,
    });

    customer.orderHistory.push(order._id);
    customer.address = deliveryAddress;
    await customer.save();

    res.status(201).json({
      order,
      confirmationMessage: buildConfirmationMessage(order),
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/orders/track/:trackingNumber
exports.trackOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ trackingNumber: req.params.trackingNumber }).populate(
      "products.product"
    );
    if (!order) return res.status(404).json({ error: "No order found with that tracking number" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/orders/:id/status  (admin)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { ...(status && { status }), ...(paymentStatus && { paymentStatus }) },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/orders  (admin)
exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("customer", "name phoneNumber").sort({ createdAt: -1 });
    res.json({ count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Same-category upsell: suggest other in-stock items from a category the
// customer just bought from. Simple version of the "auto upselling" bonus feature.
exports.getUpsellSuggestions = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    const purchasedIds = order.products.map((p) => p.product);
    const purchasedProducts = await Product.find({ _id: { $in: purchasedIds } });
    const categories = [...new Set(purchasedProducts.map((p) => p.category))];

    const suggestions = await Product.find({
      category: { $in: categories },
      _id: { $nin: purchasedIds },
      stockCount: { $gt: 0 },
    }).limit(3);

    res.json({ suggestions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

function buildConfirmationMessage(order) {
  const lines = order.products.map((p) => `- ${p.productName} x${p.quantity} (Rs ${p.price})`);
  return [
    "Your order has been placed!",
    ...lines,
    `Total: Rs ${order.totalAmount}`,
    `Tracking number: ${order.trackingNumber}`,
    `Delivery address: ${order.deliveryAddress}`,
  ].join("\n");
}
