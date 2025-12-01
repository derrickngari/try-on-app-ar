const axios = require("axios");
const Payment = require("../models/Payment");
const { formatPhoneNumber } = require("../utils/formatPhoneNumber");
const { queryWithRetry } = require("../utils/queryWithRetry");

const MPESA_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

exports.sendStkPush = async (req, res) => {
  const token = req.token;
  if (!token) {
    return res.status(401).json({ message: "M-Pesa access token required", success: false });
  }

  try {
    const { amount, phoneNumber, accountReference, transactionDesc } = req.body;
    const userId = req.user.id;
    const formattedNumber = formatPhoneNumber(phoneNumber, "254");

    if (!amount || !phoneNumber || !accountReference || !transactionDesc) {
      return res.status(400).json({ message: "Missing required fields", success: false });
    }

    const pendingPayment = await Payment.create({
      userId,
      amount,
      phoneNumber: formattedNumber,
      status: "Pending",
      checkoutId: null,
    });
    console.log("Pending Payment Created:", pendingPayment._id);

    const timestamp = new Date().toISOString().replace(/[^0-9]/g, "").slice(0, -3);
    const password = Buffer.from(
      `${process.env.MPESA_BUSINESS_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const resp = await axios.post(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: amount,
        PartyA: formattedNumber,
        PartyB: process.env.MPESA_BUSINESS_SHORTCODE,
        PhoneNumber: formattedNumber,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (resp.data.ResponseCode === "0") {
      await Payment.findByIdAndUpdate(pendingPayment._id, {
        checkoutId: resp.data.CheckoutRequestID,
        merchantRequestId: resp.data.MerchantRequestID,
      });

      return res.status(200).json({
        message: "STK push sent successfully",
        success: true,
        checkoutRequestID: resp.data.CheckoutRequestID,
        paymentId: pendingPayment._id,
      });
    } else {
      await Payment.findByIdAndUpdate(pendingPayment._id, {
        status: "Failed",
        message: resp.data.ResponseDescription,
      });
      return res.status(400).json({
        message: "STK push failed",
        success: false,
        error: resp.data.ResponseDescription,
      });
    }
  } catch (error) {
    console.error("STK Push Error:", error.message);
    return res.status(500).json({
      message: "Failed to send STK Push",
      success: false,
      error: error.message,
    });
  }
};

exports.handleMpesaCallback = async (req, res) => {
  const callbackData = req.body;
  // console.log("M-Pesa Callback Data:", JSON.stringify(callbackData, null, 2));

  try {
    if (!callbackData.Body || !callbackData.Body.stkCallback) {
      console.error("Invalid callback structure:", callbackData);
      return res.status(400).json({
        message: "Invalid M-Pesa callback format",
        success: false,
      });
    }

    const resultCode = callbackData.Body.stkCallback.ResultCode;
    const checkoutId = callbackData.Body.stkCallback.CheckoutRequestID;

    // find payment
    const payment = await Payment.findOne({ checkoutId: checkoutId });
    if (!payment) {
      console.error("Payment not found for checkout: ", checkoutId);
      return res.status(200).json({ ResultCode: 0, ResultDesc: "OK", statusCode: 200 });
    }

    // console.log("Callback Result Code:", resultCode);

    if (resultCode !== 0) {
      console.error("M-Pesa Callback Failed:", {
        resultCode,
        resultDesc: callbackData.Body.stkCallback.ResultDesc,
        checkoutId,
      });

      // Update DB
      await Payment.findOneAndUpdate(
        { checkoutId },
        { status: "Failed", message: callbackData.Body.stkCallback.ResultDesc }
      );

      return res.status(200).json({
        ResultCode: 0,
        ResultDesc: "Accepted (but payment failed)",
      });
    }

    // Extract metadata
    const metadata = callbackData.Body.stkCallback.CallbackMetadata?.Item || [];
    if (metadata.length < 2) {
      console.error("Invalid metadata:", metadata);
      return res.status(400).json({
        message: "Invalid M-Pesa metadata",
        success: false,
      });
    }

    const phone = metadata.find((item) => item.Name === "PhoneNumber")?.Value;
    const amount = metadata.find((item) => item.Name === "Amount")?.Value;
    const mpesaCode = metadata.find(
      (item) => item.Name === "MpesaReceiptNumber"
    )?.Value;
    const transDate = metadata.find(
      (item) => item.Name === "TransactionDate"
    )?.Value;

    if (!phone || !amount || !mpesaCode) {
      console.error("Missing metadata fields:", { phone, amount, mpesaCode });
      return res.status(400).json({
        message: "Missing payment details in callback",
        success: false,
      });
    }

    // Save to DB
    await Payment.findOneAndUpdate(
      { checkoutId },
      {
        mpesaCode,
        status: "Completed",
        transactionDate: transDate,
      }
    );

    // sendOrderConfirmation(req.user?.email, newTransaction);

    res.status(200).json({
      message: "M-Pesa updated successfully to Completed",
      paymentId: payment._id,
      checkoutRequestId: checkoutId,
      mpesaCode,
      success: true,
    });
  } catch (error) {
    console.error("Error processing M-Pesa Callback:", error.message);
    console.error("Full error:", error);

    res.status(200).json({
      ResultCode: 0,
      ResultDesc: "Accepted (internal error handled)",
    });
  }
};

exports.stkQuery = async (req, res) => {
  const { checkoutRequestID } = req.body;
  if (!checkoutRequestID) {
    return res.status(400).json({ message: "Checkout Request ID is required", success: false });
  }

  const token = req.token;
  if (!token) {
    return res
      .status(500)
      .json({ message: "Failed to get Mpesa access token", success: false });
  }

  try {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);
    const password = Buffer.from(
      `${process.env.MPESA_BUSINESS_SHORTCODE}${process.env.MPESA_PASSKEY}${timestamp}`
    ).toString("base64");

    const requestBody = {
      BusinessShortCode: process.env.MPESA_BUSINESS_SHORTCODE,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestID,
    };

    const resp = await queryWithRetry(() =>
      axios.post(`${MPESA_BASE_URL}/mpesa/stkpushquery/v1/query`, requestBody, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
    );

    if (resp.data.ResponseCode === "0") {
      console.log("Response data: ", JSON.stringify(resp.data, null, 2));
      const payment = await Payment.findOne({ checkoutId: resp.data.CheckoutRequestID });

      return res.status(200).json({
        message: "STK Query successful",
        success: true,
        status: payment.status || "Unknown",
        mpesaCode: payment.mpesaCode || null,
        response: resp.data,
      });
    } else {
      return res.status(400).json({
        message: "STK Query failed",
        response: resp.data,
        success: false,
      });
    }
  } catch (error) {
    console.error("Error during STK Query: ", error.message);
    return res.status(500).json({
      message: "Failed to perform STK Query",
      error: error.message,
    });
  }
};
