require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const productRoutes = require("./routes/productRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const webhookRoutes = require("./routes/webhookRoutes");

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Member 1
app.use("/api/products", productRoutes);
// Member 2
app.use("/api/customers", customerRoutes);
app.use("/api/orders", orderRoutes);
// Member 3
app.use("/api/webhook", webhookRoutes);

app.get("/", (req, res) => res.json({ status: "FashionHub AI backend is running" }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
