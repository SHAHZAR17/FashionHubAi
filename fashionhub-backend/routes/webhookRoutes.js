// Member 3 — Webhook + conversation routes
const express = require("express");
const router = express.Router();
const {
  verifyInstagramWebhook,
  receiveInstagramMessage,
  verifyWhatsAppWebhook,
  receiveWhatsAppMessage,
  getConversations,
} = require("../controllers/messageController");

// Meta calls GET once to verify the URL, then POSTs every incoming message
router.get("/instagram", verifyInstagramWebhook);
router.post("/instagram", receiveInstagramMessage);

router.get("/whatsapp", verifyWhatsAppWebhook);
router.post("/whatsapp", receiveWhatsAppMessage);

// Admin: view conversation history
router.get("/conversations", getConversations);

module.exports = router;
