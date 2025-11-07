// controllers/userController.js
const User = require("../models/User");

// ========== LẤY DANH SÁCH NGƯỜI DÙNG ==========
exports.getUsers = async (req, res) => {
  try {
    // Chỉ admin mới được xem danh sách người dùng
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Bạn không có quyền xem danh sách người dùng" });
    }

    const users = await User.find().select("-password"); // Ẩn mật khẩu
    res.status(200).json(users);
  } catch (err) {
    console.error("❌ Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi lấy danh sách người dùng" });
  }
};

// ========== TẠO USER (chỉ dùng test hoặc đăng ký) ==========
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Thiếu thông tin người dùng" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const newUser = new User({ name, email, password, role: role || "user" });
    await newUser.save();

    res.status(201).json({ message: "Tạo người dùng thành công", user: newUser });
  } catch (err) {
    console.error("❌ Lỗi khi tạo người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi tạo người dùng" });
  }
};

// ========== XÓA NGƯỜI DÙNG ==========
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Admin có thể xóa bất kỳ ai, user chỉ được xóa chính mình
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(403).json({ message: "Bạn không có quyền xóa người dùng này" });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ message: "Xóa người dùng thành công" });
  } catch (err) {
    console.error("❌ Lỗi khi xóa người dùng:", err);
    res.status(500).json({ message: "Lỗi server khi xóa người dùng" });
  }
};

// ========== CẬP NHẬT QUYỀN (Admin/User) ==========
exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Chỉ admin mới có thể cập nhật quyền" });
    }

    if (!["admin", "user"].includes(role)) {
      return res.status(400).json({ message: "Quyền không hợp lệ" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    }

    res.json({ message: "Cập nhật quyền thành công", user: updatedUser });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật quyền:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật quyền" });
  }
};
