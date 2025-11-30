const express = require("express");
const {
  sendStkPush,
  handleMpesaCallback,
  stkQuery,
} = require("../controllers/paymentControllers");
const { paymentMiddleware } = require("../middlewares/paymentMiddleware");
const { authMiddleware } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/mpesa/stk-query", paymentMiddleware, stkQuery);
router.post("/mpesa/stk-push", authMiddleware, paymentMiddleware, sendStkPush);
router.post("/mpesa/callback", express.raw({ type: "application/json"}), handleMpesaCallback);

module.exports = router;
