const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123"; // ⚠️ nên lưu trong .env

// Đăng ký
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Kiểm tra trùng email
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    await user.save();

    res.status(201).json({ message: "Đăng ký thành công", user });
  } catch (err) {
    console.error("❌ Lỗi đăng ký:", err);
    res.status(500).json({ message: "Lỗi server khi đăng ký" });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
};

// Đăng xuất (client tự xóa token)
exports.logout = async (req, res) => {
  try {
    res.json({ message: "Đăng xuất thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi đăng xuất" });
  }
};
