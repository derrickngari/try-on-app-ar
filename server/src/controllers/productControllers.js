const Product = require("../models/Product");

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({
      message: "Products fetched successfully",
      statusCode: 200,
      success: true,
      products,
    });
  } catch (error) {
    console.log("Error fetching all products:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      statusCode: 500,
      success: false,
    });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;

    // if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    //   return res.status(400).json({
    //     message: "Invalid product ID",
    //     success: false,
    //   });
    // }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
        success: false,
      });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      statusCode: 200,
      success: true,
      product,
    });
  } catch (error) {
    console.log("Error fetching product by ID:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      statusCode: 500,
      success: false,
    });
  }
};

const createProduct = async (req, res) => {
  try {
    const {
      name,
      price,
      category,
      description,
      image,
      images,
      colors,
      materials,
      badge,
    } = req.body;

    if (!name || !price || !category || !description || !image) {
      return res.status(400).json({
        message: "Please provide all required fields",
        success: false,
      });
    }

    // Generate a simple ID if not provided (or use a library like uuid in production)
    const id = name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now();

    const newProduct = await Product.create({
      id,
      name,
      price,
      category,
      description,
      image,
      images: images || [image],
      colors: colors || [],
      materials: materials || [],
      badge,
      rating: 0,
      reviewCount: 0,
    });

    res.status(201).json({
      message: "Product created successfully",
      statusCode: 201,
      success: true,
      product: newProduct,
    });
  } catch (error) {
    console.log("Error creating product:", error.message);
    res.status(500).json({
      message: "Internal Server Error",
      statusCode: 500,
      success: false,
    });
  }
};

module.exports = { getAllProducts, getById, createProduct };