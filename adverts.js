const express = require("express");
const Advert = require("../models/Advert");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const adverts = await Advert.find({}).sort({ createdAt: -1 }).limit(50);
  res.json(adverts);
});

router.get("/mine", requireStaff, async (req, res) => {
  const adverts = await Advert.find({ staffId: req.staff._id }).sort({ createdAt: -1 });
  res.json(adverts);
});

router.post("/", requireStaff, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) return res.status(400).json({ error: "Title and message are required." });
    const advert = await Advert.create({ title, message, staffId: req.staff._id, staffName: req.staff.name });
    res.json(advert);
  } catch (e) {
    res.status(500).json({ error: "Couldn't post advert." });
  }
});

router.delete("/:id", requireStaff, async (req, res) => {
  try {
    const advert = await Advert.findById(req.params.id);
    if (!advert) return res.status(404).json({ error: "Advert not found." });
    if (String(advert.staffId) !== String(req.staff._id)) {
      return res.status(403).json({ error: "You can only delete your own adverts." });
    }
    await advert.deleteOne();
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Couldn't delete advert." });
  }
});

module.exports = router;
