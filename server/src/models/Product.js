const mongoose = require("mongoose");

const ColorOptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  hex: { type: String, required: true },
});

const MaterialOptionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
});

const ProductSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ["Armchair", "Dining Chair", "Sofa", "Table", "Lamp"],
      required: true,
    },
    description: { type: String, required: true },
    image: { type: String, required: true },
    images: [{ type: String, required: true }],
    colors: [ColorOptionSchema],
    materials: [MaterialOptionSchema],
    badge: { type: String },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    reviewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", ProductSchema);
