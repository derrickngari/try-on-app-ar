const Order = require("../models/Order");
const Payment = require("../models/Payment");
const { genOrderNum } = require("../utils/genOrderNum");

const createOrder = async (req, res) => {
  try {
    const { items, total, paymentMethod, deliveryAddress, paymentId, mpesaCode } = req.body;
    const userId = req.user.id;

    if (paymentMethod === "M-Pesa" && (!paymentId || !mpesaCode)) {
      return res.status(400).json({ message: "M-Pesa payment ID and code required", success: false });
    }

    const orderId = genOrderNum("VIS");

    const order = new Order({
      userId,
      items,
      total,
      paymentMethod,
      deliveryAddress,
      orderNumber: orderId,
      payment: {
        method: paymentMethod,
        transactionId: paymentId,
        paidAt: new Date(),
        mpesaCode: mpesaCode,
      }
    });
    await order.save();

    if (paymentId) {
      await Payment.findByIdAndUpdate(paymentId, { orderId: order._id, status: "Completed" });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId })
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate('items.product', 'name image price');
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById };