// backend/server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

// ✅ Load biến môi trường từ .env (đảm bảo file .env nằm trong thư mục backend)
dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Kiểm tra biến Cloudinary (debug nếu lỗi)
if (!process.env.CLOUDINARY_API_KEY) {
  console.error("❌ CLOUDINARY_API_KEY chưa được nạp từ .env");
} else {
  console.log("✅ Cloudinary key loaded:", process.env.CLOUDINARY_API_KEY);
}

// ✅ Routes
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const profileRoutes = require("./routes/profile");

// ✅ Mount routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("🚀 Backend đang chạy!");
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
