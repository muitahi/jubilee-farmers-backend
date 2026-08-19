const Session = require("../models/Session");
const Staff = require("../models/Staff");

// Attaches req.staff if a valid session token is present. Does not block the request.
async function attachStaff(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return next();
    const session = await Session.findOne({ token });
    if (!session) return next();
    const staff = await Staff.findById(session.staffId);
    if (staff && staff.approved) req.staff = staff;
  } catch (e) {
    // ignore — req.staff just stays unset
  }
  next();
}

// Blocks the request unless attachStaff found a valid, approved staff member.
function requireStaff(req, res, next) {
  if (!req.staff) return res.status(401).json({ error: "Please log in as staff to do this." });
  next();
}

module.exports = { attachStaff, requireStaff };
