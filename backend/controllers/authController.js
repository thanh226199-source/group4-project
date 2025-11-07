// =================== IMPORT ===================
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const cloudinary = require("cloudinary").v2;

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ✅ Cấu hình Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "your_cloud_name",
  api_key: process.env.CLOUDINARY_API_KEY || "your_api_key",
  api_secret: process.env.CLOUDINARY_API_SECRET || "your_api_secret",
});

// =================== ĐĂNG KÝ ===================
exports.signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email đã tồn tại" });

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

// =================== ĐĂNG NHẬP ===================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });

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

// =================== ĐĂNG XUẤT ===================
exports.logout = (req, res) => {
  try {
    res.json({ message: "Đăng xuất thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server khi đăng xuất" });
  }
};

// =================== QUÊN MẬT KHẨU ===================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email không tồn tại" });

    // 🔹 Tạo JWT token reset có hiệu lực 15 phút
    const resetToken = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "15m" });
    const resetLink = `http://localhost:3000/reset-password/${resetToken}`;

    // 🔹 Cấu hình Gmail (App Password)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 🔹 Gửi email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Đặt lại mật khẩu",
      html: `
        <h3>Xin chào ${user.name || "bạn"},</h3>
        <p>Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết bên dưới để đặt lại:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>Liên kết này chỉ có hiệu lực trong 15 phút.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "✅ Đã gửi email đặt lại mật khẩu!" });
  } catch (err) {
    console.error("❌ Lỗi forgotPassword:", err);
    res.status(500).json({ message: "Lỗi server khi gửi email đặt lại mật khẩu" });
  }
};

// =================== ĐẶT LẠI MẬT KHẨU ===================
exports.resetPassword = async (req, res) => {
  try {
    const { token, password, newPassword } = req.body;

    // ✅ Cho phép frontend gửi password HOẶC newPassword
    const finalPassword = password || newPassword;

    if (!token || !finalPassword) {
      console.warn("⚠️ Thiếu dữ liệu gửi từ frontend:", req.body);
      return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới" });
    }

    // 🔹 Giải mã token
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "Người dùng không tồn tại" });

    // 🔹 Cập nhật mật khẩu mới
    user.password = await bcrypt.hash(finalPassword, 10);
    await user.save();

    res.json({ message: "✅ Đặt lại mật khẩu thành công!" });
  } catch (err) {
    console.error("❌ Lỗi resetPassword:", err);
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Token đã hết hạn, vui lòng yêu cầu lại" });
    }
    res.status(500).json({ message: "Lỗi server khi đặt lại mật khẩu" });
  }
};

// =================== UPLOAD AVATAR ===================
exports.uploadAvatar = async (req, res) => {
  try {
    const { userId } = req.body;
    const file = req.file;
    if (!file) return res.status(400).json({ message: "Chưa chọn ảnh" });

    const result = await cloudinary.uploader.upload(file.path, { folder: "avatars" });
    await User.findByIdAndUpdate(userId, { avatar: result.secure_url });

    res.json({ message: "Cập nhật avatar thành công!", avatarUrl: result.secure_url });
  } catch (err) {
    console.error("❌ Lỗi upload-avatar:", err);
    res.status(500).json({ message: "Lỗi server khi tải ảnh lên" });
  }
};
