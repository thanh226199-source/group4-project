


const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }
});

module.exports = mongoose.model("User", userSchema);
// // routes/user.js
// const express = require('express');
// const router = express.Router();

// // GET /users  (note: since server uses app.use('/users', userRoutes), here path is '/')
// router.get('/', userController.getUsers);

// // POST /users
// router.post('/', userController.createUser);

// module.exports = router;
// routes/user.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET /users
router.get("/", userController.getUsers);

// POST /users
router.post("/", userController.createUser);


module.exports = router;

const express = require("express");
const User = require("../models/User");
const bcrypt = require("bcrypt");
const { verifyToken, requireAdmin } = require("../middlewares/auth"); // ✅ Dùng middleware chung

console.log({ verifyToken, requireAdmin });

/* ======================================================
   📌 [GET] /api/profile - Xem thông tin user hiện tại
====================================================== */
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    console.error("❌ Lỗi khi lấy hồ sơ:", err);
    res.status(500).json({ message: "Lỗi server khi lấy hồ sơ" });
  }
});

/* ======================================================
   📌 [GET] /api/users - Admin xem danh sách user
====================================================== */
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách" });
  }
});

/* ======================================================
   📌 [POST] /api/users - Admin thêm user mới
====================================================== */
router.post("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password || "123456", 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await newUser.save();
    res.status(201).json({
      message: "Thêm người dùng thành công",
      user: { ...newUser.toObject(), password: undefined },
    });
  } catch (err) {
    console.error("❌ Lỗi khi thêm người dùng:", err);
    res.status(400).json({ message: "Lỗi khi thêm người dùng" });
  }
});

/* ======================================================
   📌 [PUT] /api/users/:id - Admin hoặc chính user cập nhật
====================================================== */
router.put("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id)
      return res.status(403).json({ message: "Không có quyền cập nhật!" });

    const updateData = { ...req.body };
    if (req.user.role !== "admin") delete updateData.role;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({
      message: "Cập nhật thành công",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật người dùng:", err);
    res.status(400).json({ message: "Lỗi khi cập nhật người dùng" });
  }
});

/* ======================================================
   📌 [DELETE] /api/users/:id - Admin hoặc chính user xóa
====================================================== */
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Không có quyền xóa!" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({ message: "Đã xóa người dùng thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi xóa người dùng:", err);
    res.status(400).json({ message: "Lỗi khi xóa người dùng" });
  }
});

module.exports = router;

