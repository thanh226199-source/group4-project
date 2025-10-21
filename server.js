// backend/server.js
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
