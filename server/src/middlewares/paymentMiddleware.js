const axios = require('axios');

exports.paymentMiddleware = async (req, res, next) => {
    const MPESA_BASE_URL =
    process.env.NODE_ENV === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

    try {
        const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
        console.log("BAsic auth token: ", auth);
        const res = await axios.get(`${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
            headers: {
                Authorization: `Basic ${auth}`,
            }
        });

        req.token = res.data.access_token;
        console.log("Mpesa access token middleware: ", req.token);
        next();
    } catch (error) {
        console.log("Mpesa middleware error: ", error.message);
        return null;
    }
}