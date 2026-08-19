const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, default: "" },
  method: { type: String, default: "" },
  payment: { type: String, default: "cash" },
  paymentStatus: { type: String, default: "" },
  mpesaReceipt: { type: String, default: "" },
  bankRef: { type: String, default: "" },
  note: { type: String, default: "" },
  items: { type: Array, required: true },
  total: { type: Number, required: true },
  staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
  staffName: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
