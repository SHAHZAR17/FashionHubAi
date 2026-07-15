// Member 3 — Webhook intake + AI orchestration
// This is the piece that connects Instagram/WhatsApp -> intent detection ->
// Member 1's product search -> AI reply -> Member 2's order flow (for the
// order-placement intent) -> conversation log.
const axios = require("axios");
const Product = require("../models/Product");
const Conversation = require("../models/Conversation");
const { findOrCreateByPlatformId } = require("./customerController");
const { detectIntent, detectSentiment } = require("../services/intentService");
const { generateSalesReply } = require("../services/aiService");

const WELCOME_MENU = [
  "Welcome to FashionHub!",
  "Thank you for contacting us. How may I help you today?",
  "1. New Arrivals",
  "2. Women's Collection",
  "3. Men's Collection",
  "4. Order Tracking",
  "5. Delivery Information",
].join("\n");

// --- Webhook verification (GET) -------------------------------------------
// Meta/WhatsApp both hit this once when you register the webhook URL.
exports.verifyInstagramWebhook = (req, res) => verifyWebhook(req, res, process.env.IG_VERIFY_TOKEN);
exports.verifyWhatsAppWebhook = (req, res) => verifyWebhook(req, res, process.env.WHATSAPP_VERIFY_TOKEN);

function verifyWebhook(req, res, expectedToken) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (mode === "subscribe" && token === expectedToken) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
}

// --- Incoming message handlers (POST) --------------------------------------
exports.receiveInstagramMessage = async (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const messaging = entry?.messaging?.[0];
    const senderId = messaging?.sender?.id;
    const text = messaging?.message?.text;

    if (senderId && text) {
      await handleIncomingMessage({ platform: "instagram", platformId: senderId, text });
    }
    res.sendStatus(200); // Meta expects a fast 200 regardless of processing result
  } catch (err) {
    console.error("Instagram webhook error:", err.message);
    res.sendStatus(200);
  }
};

exports.receiveWhatsAppMessage = async (req, res) => {
  try {
    const value = req.body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    const senderId = message?.from;
    const text = message?.text?.body;

    if (senderId && text) {
      await handleIncomingMessage({ platform: "whatsapp", platformId: senderId, text });
    }
    res.sendStatus(200);
  } catch (err) {
    console.error("WhatsApp webhook error:", err.message);
    res.sendStatus(200);
  }
};

// --- Shared orchestration logic --------------------------------------------
async function handleIncomingMessage({ platform, platformId, text }) {
  const customer = await findOrCreateByPlatformId(platform, platformId);

  let conversation = await Conversation.findOne({ customer: customer._id, platform });
  if (!conversation) {
    conversation = await Conversation.create({ customer: customer._id, platform, messages: [] });
  }

  const intent = detectIntent(text);
  const sentiment = detectSentiment(text);

  const reply = await buildReply(intent, text);

  conversation.messages.push({ sender: "customer", text, intent, sentiment });
  conversation.messages.push({ sender: "ai", text: reply });
  conversation.lastIntent = intent;
  conversation.lastSentiment = sentiment;
  await conversation.save();

  await sendPlatformMessage(platform, platformId, reply);
  return reply;
}

async function buildReply(intent, text) {
  if (intent === "Greeting") return WELCOME_MENU;

  if (intent === "ProductSearch") {
    const products = await Product.find({ $text: { $search: text } }).limit(3);
    return generateSalesReply(text, products);
  }

  // Order placement, delivery, complaints, etc. still go through the AI
  // for a natural reply; product context is empty for these intents.
  return generateSalesReply(text, []);
}

// --- Outbound send helpers ---------------------------------------------
async function sendPlatformMessage(platform, recipientId, text) {
  try {
    if (platform === "instagram") {
      await axios.post(
        `https://graph.facebook.com/v19.0/me/messages`,
        { recipient: { id: recipientId }, message: { text } },
        { params: { access_token: process.env.IG_PAGE_ACCESS_TOKEN } }
      );
    } else if (platform === "whatsapp") {
      await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        { messaging_product: "whatsapp", to: recipientId, text: { body: text } },
        { headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` } }
      );
    }
  } catch (err) {
    console.error(`Failed to send ${platform} message:`, err.response?.data || err.message);
  }
}

// --- Admin: view conversations ----------------------------------------
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .populate("customer", "name phoneNumber instagramId whatsappId")
      .sort({ updatedAt: -1 });
    res.json({ count: conversations.length, conversations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
