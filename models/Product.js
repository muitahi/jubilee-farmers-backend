const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  cat: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String, default: "" },
  price: { type: Number, required: true, default: 0 },
  glyph: { type: String, default: "" },
  img: { type: String, default: "" },
  badge: { type: String, default: "" },
  stock: { type: String, default: "In stock" },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
