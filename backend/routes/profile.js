// backend/routes/profile.js
const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const jwt = require("jsonwebtoken");

// middleware verifyToken (dùng same secret "secret-key")
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Thiếu token" });
  const token = authHeader.split(" ")[1];
  jwt.verify(token, "secret-key", (err, decoded) => {
    if (err) return res.status(401).json({ message: "Token không hợp lệ" });
    req.user = decoded; // decoded should contain { id, email, ... }
    next();
  });
}

router.get("/", verifyToken, profileController.getProfile);
router.put("/", verifyToken, profileController.updateProfile);

module.exports = router;
