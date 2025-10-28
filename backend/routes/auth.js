const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Route đăng ký / đăng nhập / đăng xuất
router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/logout", authController.logout);

module.exports = router;
