// Member 3 — AI service (OpenAI API calls)
const axios = require("axios");

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

const SYSTEM_PROMPT = `You are FashionHub's AI sales assistant for a clothing brand.
Be warm, professional and concise, like a real sales representative.
When products are provided in context, recommend from that list only —
never invent products, prices, or stock that were not given to you.
Keep replies short enough for a chat app (max 4-5 lines).`;

async function generateSalesReply(customerMessage, productContext = []) {
  const contextBlock = productContext.length
    ? `Available matching products:\n${productContext
        .map((p) => `- ${p.productName} | Rs ${p.price} | sizes: ${p.sizes.join(", ")} | colors: ${p.colors.join(", ")}`)
        .join("\n")}`
    : "No specific product matches were found in the catalog for this query.";

  try {
    const response = await axios.post(
      OPENAI_URL,
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: `${contextBlock}\n\nCustomer said: "${customerMessage}"` },
        ],
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("OpenAI call failed:", err.response?.data || err.message);
    // Safe fallback so the bot never goes silent if the AI call fails
    return "Thanks for reaching out! Our team will get back to you shortly with more details.";
  }
}

module.exports = { generateSalesReply };
