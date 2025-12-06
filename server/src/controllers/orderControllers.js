const Order = require("../models/Order");
const Payment = require("../models/Payment");
const { genOrderNum } = require("../utils/genOrderNum");

const createOrder = async (req, res) => {
  try {
    const {
      items,
      totalAmount,
      address,
      payment,
       } = req.body;
    const userId = req.user.id;
    console.log("RECEIVED BODY: ", req.body);

    if (payment?.method === "M-Pesa" && (!payment?.paymentId || !payment?.mpesaCode)) {
      return res
        .status(400)
        .json({
          message: "M-Pesa payment ID and code required",
          success: false,
        });
    }

    const orderId = genOrderNum("VIS");

    const order = new Order({
      userId,
      items,
      totalAmount,
      address,
      orderNumber: orderId,
      payment
    });

    await order.save();

    if (payment?.paymentId) {
      await Payment.findByIdAndUpdate(payment?.paymentId, {
        orderId: order._id,
        status: "Completed",
      });
    }

    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    res.status(500).json({ message: "Order creation failed", error });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    console.log("Controller hiiit");
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 });
    res.json({ orders });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id).populate(
      "items.product",
      "name image price"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ order });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

module.exports = { createOrder, getUserOrders, getOrderById };
