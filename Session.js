const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  createdAt: { type: Date, default: Date.now, expires: "30d" }, // sessions auto-expire after 30 days
});

module.exports = mongoose.model("Session", sessionSchema);
