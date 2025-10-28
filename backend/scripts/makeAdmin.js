// backend/scripts/makeAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function makeAdmin(email) {
  await mongoose.connect(process.env.MONGO_URI);
  const user = await User.findOne({ email });
  if (!user) {
    console.log("❌ Không tìm thấy user:", email);
    return;
  }
  user.role = "admin";
  await user.save();
  console.log(`✅ Đã cấp quyền admin cho: ${email}`);
  process.exit();
}

// ⚠️ Nhập email muốn cấp quyền admin
makeAdmin("thap555@gmail.com");
