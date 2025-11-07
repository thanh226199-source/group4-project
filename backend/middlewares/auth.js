const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

// ✅ Middleware kiểm tra token hợp lệ
exports.verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Thiếu token" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("❌ Token không hợp lệ:", err);
    res.status(403).json({ message: "Token không hợp lệ" });
  }
};

// ✅ Middleware chỉ cho phép admin
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Chỉ admin mới có quyền truy cập" });
  }
  next();
};
