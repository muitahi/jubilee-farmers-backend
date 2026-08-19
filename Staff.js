const mongoose = require("mongoose");

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  approved: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Staff", staffSchema);
