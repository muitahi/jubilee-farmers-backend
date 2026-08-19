const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const Staff = require("../models/Staff");
const Session = require("../models/Session");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

function makeToken() {
  return crypto.randomBytes(32).toString("hex");
}

router.post("/register", async (req, res) => {
  try {
    const { name, phone, password } = req.body;
    if (!name || !phone || !password || password.length < 4) {
      return res.status(400).json({ error: "Name, phone, and a password of 4+ characters are required." });
    }
    const existing = await Staff.findOne({ phone });
    if (existing) return res.status(409).json({ error: "That phone number is already registered." });

    const staffCount = await Staff.countDocuments({});
    const isFirst = staffCount === 0;

    const passwordHash = await bcrypt.hash(password, 10);
    const staff = await Staff.create({ name, phone, passwordHash, approved: isFirst });

    if (isFirst) {
      const token = makeToken();
      await Session.create({ token, staffId: staff._id });
      return res.json({
        approved: true,
        token,
        staff: { id: staff._id, name: staff.name, phone: staff.phone },
        message: "You're the first account — approved automatically.",
      });
    }
    return res.json({ approved: false, message: "Request submitted — waiting for the owner to approve you." });
  } catch (e) {
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) return res.status(400).json({ error: "Phone and password are required." });
    const staff = await Staff.findOne({ phone });
    if (!staff) return res.status(401).json({ error: "Phone number or password not recognised." });
    const ok = await bcrypt.compare(password, staff.passwordHash);
    if (!ok) return res.status(401).json({ error: "Phone number or password not recognised." });
    if (!staff.approved) return res.status(403).json({ error: "Your account is pending approval from the shop owner." });

    const token = makeToken();
    await Session.create({ token, staffId: staff._id });
    res.json({ token, staff: { id: staff._id, name: staff.name, phone: staff.phone } });
  } catch (e) {
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

router.post("/logout", requireStaff, async (req, res) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (token) await Session.deleteOne({ token });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Logout failed." });
  }
});

router.get("/me", requireStaff, async (req, res) => {
  res.json({ id: req.staff._id, name: req.staff.name, phone: req.staff.phone });
});

// Public list of staff — name/phone/approval status only, no password data.
// Lets the owner's PIN-gated admin panel show the list without needing to be logged in.
router.get("/staff", async (req, res) => {
  const staff = await Staff.find({}, "name phone approved createdAt").sort({ createdAt: -1 });
  res.json(staff);
});

router.patch("/staff/:id/approve", requireStaff, async (req, res) => {
  await Staff.findByIdAndUpdate(req.params.id, { approved: true });
  res.json({ ok: true });
});

router.patch("/staff/:id/revoke", requireStaff, async (req, res) => {
  await Staff.findByIdAndUpdate(req.params.id, { approved: false });
  await Session.deleteMany({ staffId: req.params.id }); // force-log-out everywhere, unlike before
  res.json({ ok: true });
});

module.exports = router;
