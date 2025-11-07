const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const User = require("../models/User");
const { verifyToken, requireAdmin } = require("../middlewares/auth");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

// ======================================
// ⚙️ Cấu hình Cloudinary
// ======================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ⚙️ Cấu hình Multer Storage để upload ảnh lên Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "user_avatars", // tên thư mục lưu trên Cloudinary
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const upload = multer({ storage });

// ======================================================
// 📌 [GET] /api/users/profile - Xem thông tin user hiện tại
// ======================================================
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }
    res.json(user);
  } catch (err) {
    console.error("❌ Lỗi khi lấy hồ sơ:", err);
    res.status(500).json({ message: "Lỗi server khi lấy hồ sơ" });
  }
});

// ======================================================
// 📌 [GET] /api/users - Admin xem danh sách user
// ======================================================
router.get("/", verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách" });
  }
});

// ======================================================
// 📌 [POST] /api/users - Admin thêm user mới
// ======================================================
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

// ======================================================
// 📌 [PUT] /api/users/:id - Admin hoặc chính user cập nhật
// ======================================================
router.put("/:id", verifyToken, async (req, res) => {
  try {
    // Chỉ admin hoặc chính chủ tài khoản mới được sửa
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Không có quyền cập nhật!" });
    }

    const updateData = { ...req.body };
    if (req.user.role !== "admin") delete updateData.role;

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      message: "Cập nhật thành công",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật người dùng:", err);
    res.status(400).json({ message: "Lỗi khi cập nhật người dùng" });
  }
});

// ======================================================
// 📸 [PUT] /api/users/:id/avatar - Cập nhật ảnh đại diện
// ======================================================
router.put("/:id/avatar", verifyToken, upload.single("avatar"), async (req, res) => {
  try {
    // Kiểm tra quyền
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Không có quyền đổi ảnh!" });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "Không có ảnh nào được tải lên" });
    }

    const imageUrl = req.file.path; // link ảnh từ Cloudinary

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { avatar: imageUrl },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      message: "Cập nhật ảnh thành công",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật ảnh:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật ảnh" });
  }
});

// ======================================================
// 📌 [DELETE] /api/users/:id - Admin hoặc chính user xóa
// ======================================================
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ message: "Không có quyền xóa!" });
    }

    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ message: "Đã xóa người dùng thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi xóa người dùng:", err);
    res.status(400).json({ message: "Lỗi khi xóa người dùng" });
  }
});

module.exports = router;
