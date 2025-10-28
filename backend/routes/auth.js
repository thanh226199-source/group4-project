const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { verifyToken } = require("../middlewares/auth"); // ✅ middleware kiểm tra access token

// ============================
// 🔐 AUTH ROUTES
// ============================

// Đăng ký
router.post("/signup", authController.signup);

// Đăng nhập
router.post("/login", authController.login);

// Refresh token (cấp lại Access Token khi hết hạn)
router.post("/refresh", authController.refresh);

// Đăng xuất (revoke refresh token)
router.post("/logout", authController.logout);

// Ví dụ thêm route test xác thực access token
router.get("/protected", verifyToken, (req, res) => {
  res.json({ message: "Đây là route bảo vệ, bạn có token hợp lệ!", user: req.user });
});

module.exports = router;
