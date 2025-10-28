// backend/controllers/profileController.js
const User = require("../models/User");
const bcrypt = require("bcryptjs");

// GET /api/profile  -> lấy thông tin user hiện tại (từ token)
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user?.id; // req.user được set bởi middleware verifyToken
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    res.json(user);
  } catch (err) {
    console.error("Lỗi getProfile:", err);
    res.status(500).json({ message: "Lỗi server" });
  }
};

// PUT /api/profile  -> cập nhật name, avatar, password (nếu có)
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Chưa đăng nhập" });

    const { name, avatar, password } = req.body;

    const update = {};
    if (name) update.name = name;
    if (avatar !== undefined) update.avatar = avatar; // allow empty string to clear
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      update.password = hashed;
    }

    const updated = await User.findByIdAndUpdate(userId, update, { new: true }).select("-password");
    res.json({ message: "Cập nhật thành công", user: updated });
  } catch (err) {
    console.error("Lỗi updateProfile:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật" });
  }
};
