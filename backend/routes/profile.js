const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const jwt = require("jsonwebtoken");
const { upload } = require("../middlewares/upload"); // ✅ Thêm dòng này

// 🔒 Middleware xác thực token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: "Thiếu token trong header" });

  const token = authHeader.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token không hợp lệ" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret-key");
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Lỗi xác thực token:", err.message);
    return res.status(403).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }
}

// 📌 [GET] /api/profile
router.get("/", verifyToken, profileController.getProfile);

// 📌 [PUT] /api/profile — cập nhật tên, avatar, mật khẩu
router.put("/", verifyToken, upload.single("avatar"), profileController.updateProfile); // ✅ thêm upload.single("avatar")

module.exports = router;
