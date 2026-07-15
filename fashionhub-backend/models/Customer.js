// Member 2 — Customer schema
const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, default: "" },
    phoneNumber: { type: String, default: "" },
    instagramId: { type: String, default: null, index: true },
    whatsappId: { type: String, default: null, index: true },
    address: { type: String, default: "" },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    preferences: {
      favoriteColor: { type: String, default: "" },
      favoriteCategory: { type: String, default: "" },
      budget: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

// A customer is uniquely identified by whichever platform they messaged from
customerSchema.index({ instagramId: 1 }, { unique: true, sparse: true });
customerSchema.index({ whatsappId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Customer", customerSchema);
