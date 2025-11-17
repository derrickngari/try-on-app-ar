const User = require("../models/User");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({
          message: "All fields are required",
          statusCode: 400,
          success: false,
        });

    const userExists = await User.findOne({ email });

    if (userExists)
      return res
        .status(400)
        .json({
          message: "Email already exists. Please Login",
          statusCode: 400,
          success: false,
        });

    const user = await User.create({
      name,
      email,
      password,
      profilePic:
        "https://res.cloudinary.com/dy9tybz79/image/upload/v1763328212/logo_skqupc.png",
    });

    const newUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
    };

    const token = jwt.sign(newUser, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "7d",
    });

    res
      .status(201)
      .json({
        message: "Account created successfully",
        statusCode: 201,
        sucess: true,
        user: newUser,
        accessToken: token,
      });
  } catch (error) {
    console.log("Error registering new user: ", error.message);
    res
      .status(500)
      .json({
        messsgae: "Internal Srver Error",
        statusCode: 500,
        sucess: false,
      });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Please fill in all fields",
        statusCode: 400,
        success: false,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        message: "Invalid credentials",
        statusCode: 404,
        success: false,
      });
    }

    const validPass = await user.comparePassword(password);
    if (!validPass) {
      return res.status(404).json({
        message: "Invalid credentials",
        statusCode: 404,
        success: false,
      });
    }

    const userDetails = {
      id: user._id,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
    };

    const token = jwt.sign(userDetails, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      statusCode: 200,
      success: true,
      user: userDetails,
      accessToken: token,
    });
  } catch (error) {
      console.error("Error logging in user:", error);
      res.status(500).json({
        message: "Internal Server Error",
        statusCode: 500,
        success: false,
      });
  }
};


module.exports = { register, login };