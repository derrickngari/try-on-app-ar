const axios = require("axios");
require("dotenv").config();

const MPESA_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.safaricom.co.ke"
    : "https://sandbox.safaricom.co.ke";

exports.paymentMiddleware = async (req, res, next) => {
  try {
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;

    if (!consumerKey || !consumerSecret) {
      return res.status(500).json({ message: "M-Pesa credentials missing", success: false });
    }

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");

    const tokenRes = await axios.get(
      `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
      {
        headers: { Authorization: `Basic ${auth}` },
        timeout: 10000,
      }
    );

    req.token = tokenRes.data.access_token;
    next();
  } catch (error) {
    console.error("- Status:", error.response?.status);
    console.error("- Message:", error.message);

    // Incapsula Detection
    if (error.response?.data && error.response.data.includes("Incapsula")) {
      const incidentId = error.response.data.match(/incapsula_incident_id=(\d+)/)?.[1];
      console.error("INCAPSULA BLOCK - ID:", incidentId);
    }

    return res.status(500).json({
      message: "M-Pesa token failed (IP block?)",
      success: false,
      error: error.response?.statusText || error.message,
      incidentId: error.response?.data?.match(/incapsula_incident_id=(\d+)/)?.[1] || null,
    });
  }
};