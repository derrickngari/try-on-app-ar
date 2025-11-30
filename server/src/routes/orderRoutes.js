const express = require("express");
const router = express.Router();
const { createOrder, getUserOrders, getOrderById } = require("../controllers/orderControllers");
const { authMiddleware } = require("../middlewares/authMiddleware");

router.post("/", authMiddleware, createOrder);
router.get("/", authMiddleware, getUserOrders);
router.get("/:id", authMiddleware, getOrderById);

module.exports = router;