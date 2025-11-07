const User = require("../models/User");
const RefreshToken = require("../models/RefreshToken"); // ✅ thêm mới
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// 🔐 Lấy secret từ file .env
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret";
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || "refresh_secret";

// ============================
// 🔹 Hàm tạo Access / Refresh Token
// ============================
function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // thời gian sống ngắn hơn
  );
}

function generateRefreshToken(user) {
  return jwt.sign(
    { id: user._id },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
}

// ============================
// 🧩 Đăng ký
// ============================
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

// ============================
// 🧩 Đăng nhập
// ============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

    // Tạo token
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Lưu refresh token vào DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 ngày
    await RefreshToken.create({ userId: user._id, token: refreshToken, expiresAt });

    res.json({
      message: "Đăng nhập thành công",
      accessToken,
      refreshToken,
      user: { ...user.toObject(), password: undefined },
    });
  } catch (err) {
    console.error("❌ Lỗi đăng nhập:", err);
    res.status(500).json({ message: "Lỗi server khi đăng nhập" });
  }
};

// ============================
// ♻️ Refresh Token
// ============================
exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ message: "Thiếu refresh token" });

    // Kiểm tra token có trong DB không
    const stored = await RefreshToken.findOne({ token: refreshToken });
    if (!stored) return res.status(403).json({ message: "Refresh token không hợp lệ" });

    // Xác thực refresh token
    jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(403).json({ message: "Refresh token hết hạn hoặc không hợp lệ" });

      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });

      // Tạo access token mới
      const newAccessToken = generateAccessToken(user);

      res.json({
        accessToken: newAccessToken,
        message: "Cấp lại access token thành công",
      });
    });
  } catch (err) {
    console.error("❌ Lỗi refresh token:", err);
    res.status(500).json({ message: "Lỗi server khi refresh token" });
  }
};

// ============================
// 🚪 Đăng xuất
// ============================
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ message: "Thiếu refresh token" });

    // Xóa refresh token trong DB để revoke
    await RefreshToken.deleteOne({ token: refreshToken });

    res.json({ message: "Đăng xuất thành công, token đã bị thu hồi" });
  } catch (err) {
    console.error("❌ Lỗi đăng xuất:", err);
    res.status(500).json({ message: "Lỗi server khi đăng xuất" });
  }
};
