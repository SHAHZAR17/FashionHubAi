// Member 3 — Conversation log schema (feeds the admin "View Conversations"
// and "Train AI Responses" features)
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, enum: ["customer", "ai", "admin"], required: true },
    text: { type: String, required: true },
    intent: { type: String, default: null },
    sentiment: { type: String, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const conversationSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    platform: { type: String, enum: ["instagram", "whatsapp"], required: true },
    messages: { type: [messageSchema], default: [] },
    lastIntent: { type: String, default: null },
    lastSentiment: { type: String, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);
