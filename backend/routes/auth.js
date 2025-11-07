const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const authController = require("../controllers/authController");

// ⚙️ Cấu hình multer để upload ảnh tạm (trước khi gửi lên Cloudinary)
const upload = multer({ dest: "uploads/" });

// ========== AUTH ROUTES CƠ BẢN ==========
// Đăng ký
router.post("/signup", authController.signup);

// Đăng nhập
router.post("/login", authController.login);

// Đăng xuất
router.post("/logout", authController.logout);

// ========== TÍNH NĂNG NÂNG CAO (HOẠT ĐỘNG 4) ==========
// Quên mật khẩu - gửi token reset qua email
router.post("/forgot-password", authController.forgotPassword);

// Đặt lại mật khẩu với token
router.post("/reset-password", authController.resetPassword);

// Upload avatar - gửi ảnh lên Cloudinary
router.post("/upload-avatar", upload.single("avatar"), authController.uploadAvatar);

module.exports = router;
