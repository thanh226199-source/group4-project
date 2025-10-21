

// backend/server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');

const userRoutes = require('./routes/user');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(cors({ origin: '*' }));
app.use(express.json());

// Test route
app.get('/', (req, res) => res.send('🚀 Backend đang chạy!'));

// Routes chính
app.use('/users', userRoutes);

// Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error('❌ Vui lòng thiết lập MONGO_URI trong file .env');
  process.exit(1);
}

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});

// const express = require("express");
// const cors = require("cors");

// const app = express();
// app.use(cors());
// app.use(express.json());

// let users = [];

// app.get("/users", (req, res) => {
//   res.json(users);
// });

// app.post("/users", (req, res) => {
//   const user = req.body;
//   users.push(user);
//   console.log("✅ User received:", user);
//   res.status(201).json(user);
// });

// app.listen(5000, "0.0.0.0", () => {
//   console.log("✅ Server running on port 5000");
// });
// server.js

const express = require("express");
const cors = require("cors");
const morgan = require("morgan"); // ghi log request

const app = express();

// middleware
app.use(morgan("dev"));
app.use(cors({ origin: "*" }));
app.use(express.json());

// import routes
const userRoutes = require("./routes/user");
app.use("/users", userRoutes);

// test nhanh
app.get("/", (req, res) => res.send("✅ Backend OK!"));

// chạy server
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});
