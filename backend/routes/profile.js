// routes/profile.js
const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middlewares/auth");

/* ======================================================
   📌 [GET] /api/profile - Lấy thông tin user hiện tại
====================================================== */
router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });
    res.json(user);
  } catch (err) {
    console.error("❌ Lỗi khi lấy hồ sơ:", err);
    res.status(500).json({ message: "Lỗi server khi lấy hồ sơ" });
  }
});

/* ======================================================
   📌 [PUT] /api/profile - Cập nhật thông tin user hiện tại
====================================================== */
router.put("/", verifyToken, async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.password) delete updateData.password; // không cho đổi pass ở đây

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser)
      return res.status(404).json({ message: "Không tìm thấy người dùng" });

    res.json({
      message: "Cập nhật hồ sơ thành công",
      user: updatedUser,
    });
  } catch (err) {
    console.error("❌ Lỗi khi cập nhật hồ sơ:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật hồ sơ" });
  }
});

module.exports = router;
