const { Router } = require("express");
const { getAllProducts, getById } = require("../controllers/productControllers");

const router = Router();

router.get("/", getAllProducts);
router.get("/:id", getById);

module.exports = router;