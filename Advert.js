const mongoose = require("mongoose");

const advertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  message: { type: String, required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  staffName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Advert", advertSchema);
