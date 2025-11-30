const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");

const { connectDb } = require("./config/connectDb");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orders = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: "*",
}));
app.use(express.json());
// app.use(bodyParser());

connectDb();

app.get("/", (req, res) => {
    res.send("Visara backend API running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", orders);

app.listen(PORT, (req, res) => console.log(`Server running on port ${PORT}`));