const jwt = require("jsonwebtoken");

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "access_secret_123";

// ✅ Middleware kiểm tra Access Token hợp lệ
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Lấy token từ header: Bearer <token>

  if (!token) return res.status(401).json({ message: "Bạn chưa đăng nhập hoặc thiếu token" });

  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("❌ Token không hợp lệ hoặc hết hạn:", err.message);
      return res.status(403).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    req.user = decoded; // Gán thông tin user (id, role, ...) vào req
    next();
  });
};

// ✅ Middleware kiểm tra quyền admin
exports.requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }
  next();
};

// ✅ Hàm tạo Access Token mới (dùng trong refresh token)
exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "15m" } // Access Token hết hạn sau 15 phút
  );
};
