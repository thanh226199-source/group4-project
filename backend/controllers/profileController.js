const User = require("../models/User");
const bcrypt = require("bcryptjs");

/**
 * 📌 GET /api/profile
 * → Lấy thông tin người dùng hiện tại
 */
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "⚠️ Bạn chưa đăng nhập" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "❌ Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (err) {
    console.error("🔥 Lỗi getProfile:", err);
    res.status(500).json({ message: "Lỗi server khi lấy thông tin hồ sơ" });
  }
};

/**
 * 📌 PUT /api/profile
 * → Cập nhật thông tin cá nhân + upload avatar lên Cloudinary
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "⚠️ Bạn chưa đăng nhập" });
    }

    const update = {};
    const { name, password, avatar } = req.body;

    // 🧾 Cập nhật họ tên
    if (name && name.trim() !== "") {
      update.name = name.trim();
    }

    // 🔐 Nếu có mật khẩu mới, mã hóa rồi lưu
    if (password && password.trim() !== "") {
      const hashed = await bcrypt.hash(password.trim(), 10);
      update.password = hashed;
    }

    // 🖼️ Nếu có file upload qua Cloudinary
    if (req.file && req.file.path) {
      update.avatar = req.file.path;
    }

    // 🌐 Nếu có avatar URL được gửi trực tiếp (không upload file)
    if (avatar && !req.file) {
      update.avatar = avatar;
    }

    // 🧠 Cập nhật dữ liệu trong MongoDB
    const updatedUser = await User.findByIdAndUpdate(userId, update, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({
      message: "✅ Cập nhật thông tin cá nhân thành công!",
      user: updatedUser,
    });
  } catch (err) {
    console.error("🔥 Lỗi updateProfile:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật hồ sơ" });
  }
};
