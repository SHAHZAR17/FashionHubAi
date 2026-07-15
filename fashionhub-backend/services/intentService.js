// Member 3 — Intent & sentiment detection
// Fast keyword-based pass first (cheap, instant, no API cost). Falls back to
// the OpenAI call in aiService.js only when nothing matches, so most of the
// FAQ-style messages in the brief (Hi, Price?, Delivery charges? ...) never
// need to leave the server.

const INTENT_KEYWORDS = {
  Greeting: ["hi", "hello", "salam", "assalam"],
  ProductSearch: ["show", "collection", "dress", "shirt", "size", "color", "colour", "available", "price"],
  OrderPlacement: ["order", "buy", "place order", "checkout"],
  DeliveryInquiry: ["delivery", "shipping", "how long", "days"],
  Complaint: ["damaged", "wrong item", "not happy", "worst", "bad"],
  ReturnRequest: ["return", "exchange", "refund"],
  DiscountInquiry: ["discount", "sale", "offer", "cheapest"],
  OrderTracking: ["track", "tracking", "where is my", "parcel", "order status"],
};

const POSITIVE_WORDS = ["thanks", "great", "love", "awesome", "good", "nice"];
const NEGATIVE_WORDS = ["bad", "worst", "angry", "damaged", "late", "refund", "disappointed"];

function detectIntent(message) {
  const text = message.toLowerCase();
  for (const [intent, keywords] of Object.entries(INTENT_KEYWORDS)) {
    if (keywords.some((k) => text.includes(k))) return intent;
  }
  return "Unknown";
}

function detectSentiment(message) {
  const text = message.toLowerCase();
  const hasNegative = NEGATIVE_WORDS.some((w) => text.includes(w));
  const hasPositive = POSITIVE_WORDS.some((w) => text.includes(w));

  if (hasNegative) return "Frustrated";
  if (hasPositive) return "Happy";
  return "Neutral";
}

module.exports = { detectIntent, detectSentiment };
