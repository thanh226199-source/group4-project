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

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require("./routes/user");
app.use("/users", userRoutes);

const PORT = process.env.PORT || 5000;

// ⚡ Không được thiếu phần callback này nhé
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

