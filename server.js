const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const { attachStaff } = require("./middleware/auth");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const orderRoutes = require("./routes/orders");
const advertRoutes = require("./routes/adverts");

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use(attachStaff);

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/adverts", advertRoutes);

const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("MONGO_URI environment variable is not set. Set it before starting the server.");
  process.exit(1);
}

mongoose.connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => console.log(`Jubilee Farmers API running on port ${PORT}`));
  })
  .catch(err => {
    console.error("Could not connect to MongoDB:", err.message);
    process.exit(1);
  });
