// Member 1 — Seed script
// Loads the 15 sample products from Mock_Product_Data.docx into MongoDB.
// Run with: npm run seed
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Product = require("../models/Product");

const products = [
  { productName: "Black Embroidered Maxi", category: "Women's Collection", price: 3999, sizes: ["S", "M", "L", "XL"], colors: ["Black", "Maroon", "Red"], stockCount: 45, description: "Embroidered maxi dress." },
  { productName: "Classic Slim-Fit Denim Jeans", category: "Men's Collection", price: 3200, sizes: ["30", "32", "34", "36"], colors: ["Blue", "Black"], stockCount: 80, description: "Slim-fit denim jeans." },
  { productName: "Floral Print Lawn Kurti", category: "Women's Collection", price: 2450, sizes: ["S", "M", "L"], colors: ["Pink", "White", "Yellow"], stockCount: 60, description: "Floral print lawn kurti." },
  { productName: "Cotton Crew Neck T-Shirt", category: "Men's Collection", price: 1299, sizes: ["S", "M", "L", "XL", "XXL"], colors: ["White", "Grey", "Navy Blue"], stockCount: 120, description: "Cotton crew neck t-shirt." },
  { productName: "Chiffon Embellished Party Gown", category: "Women's Collection", price: 8750, sizes: ["S", "M", "L"], colors: ["Red", "Wine"], stockCount: 20, description: "Embellished chiffon party gown." },
  { productName: "Formal Slim-Fit Blazer", category: "Men's Collection", price: 6500, sizes: ["M", "L", "XL"], colors: ["Black", "Charcoal Grey"], stockCount: 35, description: "Formal slim-fit blazer." },
  { productName: "Kids Printed Hoodie", category: "Kids Collection", price: 1850, sizes: ["4-5Y", "6-7Y", "8-9Y"], colors: ["Red", "Blue", "Green"], stockCount: 70, description: "Printed hoodie for kids." },
  { productName: "Linen Straight-Cut Trousers", category: "Women's Collection", price: 3600, sizes: ["S", "M", "L", "XL"], colors: ["Beige", "Olive Green"], stockCount: 50, description: "Linen straight-cut trousers." },
  { productName: "Casual Checked Flannel Shirt", category: "Men's Collection", price: 2100, sizes: ["M", "L", "XL"], colors: ["Red-Black Check", "Blue-Grey Check"], stockCount: 65, description: "Casual checked flannel shirt." },
  { productName: "Embroidered Chiffon Dupatta", category: "Women's Collection", price: 1500, sizes: ["Free Size"], colors: ["Gold", "Peach", "Mint Green"], stockCount: 90, description: "Embroidered chiffon dupatta." },
  { productName: "Sports Performance Track Jacket", category: "Men's Collection", price: 3999, sizes: ["S", "M", "L", "XL"], colors: ["Black", "Royal Blue"], stockCount: 40, description: "Sports performance track jacket." },
  { productName: "Girls Denim Pinafore Dress", category: "Kids Collection", price: 2200, sizes: ["3-4Y", "5-6Y", "7-8Y"], colors: ["Light Blue", "Dark Blue"], stockCount: 55, description: "Denim pinafore dress for girls." },
  { productName: "Velvet Winter Shawl", category: "Women's Collection", price: 3850, sizes: ["Free Size"], colors: ["Maroon", "Navy", "Black"], stockCount: 30, description: "Velvet winter shawl." },
  { productName: "Men's Leather Formal Shoes", category: "Men's Collection", price: 5500, sizes: ["40", "41", "42", "43", "44"], colors: ["Black", "Brown"], stockCount: 25, description: "Leather formal shoes." },
  { productName: "Cotton Printed Nightwear Set", category: "Women's Collection", price: 2750, sizes: ["S", "M", "L", "XL"], colors: ["Lavender", "Grey", "Powder Blue"], stockCount: 48, description: "Cotton printed nightwear set." },
];

async function seed() {
  await connectDB();
  await Product.deleteMany({});
  await Product.insertMany(products);
  console.log(`Seeded ${products.length} products.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
