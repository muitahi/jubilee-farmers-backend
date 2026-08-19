const express = require("express");
const Product = require("../models/Product");
const { requireStaff } = require("../middleware/auth");

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await Product.find({}).sort({ createdAt: 1 });
  res.json(products);
});

router.post("/", requireStaff, async (req, res) => {
  try {
    const { cat, name, description, price, glyph, img, badge, stock } = req.body;
    if (!name) return res.status(400).json({ error: "Product name is required." });
    const product = await Product.create({ cat, name, description, price, glyph, img, badge, stock });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: "Couldn't add product." });
  }
});

router.put("/:id", requireStaff, async (req, res) => {
  try {
    const { cat, name, description, price, glyph, img, badge, stock } = req.body;
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { cat, name, description, price, glyph, img, badge, stock },
      { new: true }
    );
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json(product);
  } catch (e) {
    res.status(500).json({ error: "Couldn't update product." });
  }
});

router.delete("/:id", requireStaff, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Couldn't delete product." });
  }
});

// Bulk import — adds every product in the array as a new entry.
router.post("/import", requireStaff, async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const docs = items.map(p => ({
      cat: p.cat || "", name: p.name || "Untitled", description: p.desc || p.description || "",
      price: p.price || 0, glyph: p.glyph || "", img: p.img || "", badge: p.badge || "", stock: p.stock || "In stock",
    }));
    const created = await Product.insertMany(docs);
    res.json({ count: created.length });
  } catch (e) {
    res.status(500).json({ error: "Import failed." });
  }
});

// Reset — wipes every product and reseeds with the list provided.
router.post("/reset", requireStaff, async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    await Product.deleteMany({});
    const docs = items.map(p => ({
      cat: p.cat, name: p.name, description: p.desc, price: p.price, glyph: p.glyph, img: p.img || "", badge: p.badge || "", stock: p.stock,
    }));
    await Product.insertMany(docs);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: "Reset failed." });
  }
});

// One-time seed — only runs if the catalog is currently empty.
router.post("/seed", async (req, res) => {
  try {
    const count = await Product.countDocuments({});
    if (count > 0) return res.json({ seeded: false, reason: "Catalog already has products." });
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const docs = items.map(p => ({
      cat: p.cat, name: p.name, description: p.desc, price: p.price, glyph: p.glyph, img: p.img || "", badge: p.badge || "", stock: p.stock,
    }));
    await Product.insertMany(docs);
    res.json({ seeded: true, count: docs.length });
  } catch (e) {
    res.status(500).json({ error: "Seeding failed." });
  }
});

module.exports = router;
