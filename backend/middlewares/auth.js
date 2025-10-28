const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ✅ Kiểm tra token hợp lệ
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // gán user id + role vào req.user
    next();
  } catch (err) {
    console.error("❌ Token không hợp lệ:", err);
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};

// ✅ Chỉ cho phép admin
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }
  next();
};
