const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authMiddleware = async (req, res, next) => {
  let token = null;

//   console.log("Req: ", req)
 if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

//   console.log("Auth token: ", token);

  if (!token)
    return res.status(401).json({ message: "Authentication required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    logger.error("Authorization failed: ", err.message);
    res.status(403).json({ message: "Invalid or epired token" });
  }
};

exports.isAdmin = async (req, res, next) => {
    if (!req.user){
        return res.status(401).json({ message: "Authentication is required "});
    }

    if (req?.user?.role != 'admin'){
        return res.status(403).json({ message: "Unauthorized! Admin access required" });
    }
    next();
};