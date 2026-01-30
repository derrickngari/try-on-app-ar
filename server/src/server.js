const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv/config");
const path = require('path');

const { connectDb } = require("./config/connectDb");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const virtualStagingRoutes = require("./routes/virtualStagingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const ordersRoutes = require("./routes/orderRoutes");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: "*",
}));
app.use(express.json({ limit: '50mb' }));

// Serve static files from the 'public' directory located one level up from 'src'
// This exposes 'server/public' at the root URL (e.g., /generated/image.jpg)
app.use(express.static(path.join(__dirname, '../public')));

connectDb();

app.get("/", (req, res) => {
    res.send("Visara backend API running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/virtual-stage", virtualStagingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/orders", ordersRoutes);

app.listen(PORT, (req, res) => console.log(`Server running on port ${PORT}`));