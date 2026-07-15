// Member 2 — Order schema
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true }, // snapshot at time of order
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // snapshot at time of order
    size: { type: String, default: "" },
    color: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    trackingNumber: { type: String, required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    products: { type: [orderItemSchema], required: true },
    totalAmount: { type: Number, required: true },
    deliveryAddress: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled", "returned"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
