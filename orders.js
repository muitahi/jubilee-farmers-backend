const express = require("express");
const Order = require("../models/Order");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

// Anyone can place an order (checkout, or a staff quick-sale sends staffId/staffName in the body).
router.post("/", async (req, res) => {
  try {
    const { customerName, customerPhone, method, payment, paymentStatus, mpesaReceipt, bankRef, note, items, total, staffId, staffName } = req.body;
    if (!customerName || !items || !items.length || total == null) {
      return res.status(400).json({ error: "Missing order details." });
    }
    const order = await Order.create({
      customerName, customerPhone, method, payment, paymentStatus, mpesaReceipt, bankRef, note, items, total,
      staffId: staffId || null, staffName: staffName || "",
    });
    res.json(order);
  } catch (e) {
    res.status(500).json({ error: "Couldn't record order." });
  }
});

// Staff-only: full order log.
router.get("/", requireStaff, async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(200);
  res.json(orders);
});

// Staff-only: just this staff member's own recorded sales.
router.get("/mine", requireStaff, async (req, res) => {
  const orders = await Order.find({ staffId: req.staff._id }).sort({ createdAt: -1 }).limit(100);
  res.json(orders);
});

// Staff-only: clears every order. Deliberately destructive, used sparingly.
router.delete("/", requireStaff, async (req, res) => {
  await Order.deleteMany({});
  res.json({ ok: true });
});

module.exports = router;
