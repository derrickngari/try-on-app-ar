const { Router } = require("express");
const { getAllProducts, getById, createProduct } = require("../controllers/productControllers");

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getById);
router.post("/", createProduct);

module.exports = router;