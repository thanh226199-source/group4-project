// // controllers/userController.js

// // Mảng tạm lưu user (in-memory)
// // let users = [
// //   { id: 1, name: 'Nguyen Duy Thanh', email: 'a@example.com' },
// //   { id: 2, name: 'Nguyen Ngoc Thap', email: 'b@example.com' }
// // ];

// // GET /users
// exports.getUsers = (req, res) => {
//   res.json(users);
// };

// // POST /users
// exports.createUser = (req, res) => {
//   const { name, email } = req.body;

//   // Validation cơ bản
//   if (!name || !name.toString().trim()) {
//     return res.status(400).json({ message: 'Name is required' });
//   }
//   if (!email || !/\S+@\S+\.\S+/.test(email)) {
//     return res.status(400).json({ message: 'Valid email is required' });
//   }

//   // Tạo id đơn giản bằng timestamp (hoặc có thể dùng uuid)
//   const id = Date.now();

//   const newUser = { id, name: name.toString().trim(), email: email.toString().trim() };
//   users.push(newUser);

//   // Trả về user vừa tạo
//   res.status(201).json(newUser);
// };
// Dữ liệu mẫu tạm thời (in-memory)
let users = [
  { id: 1, name: "Nguyen Duy Thanh", email: "a@example.com" },
  { id: 2, name: "Nguyen Ngoc Thap", email: "b@example.com" },
];

// GET /users
exports.getUsers = (req, res) => {
  res.json(users);
};

// POST /users
exports.createUser = (req, res) => {
  const { name, email } = req.body;

  // Validation cơ bản
  if (!name || !name.toString().trim()) {
    return res.status(400).json({ message: "Name is required" });
  }
  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  // Tạo id đơn giản bằng timestamp
  const id = Date.now();

  const newUser = {
    id,
    name: name.toString().trim(),
    email: email.toString().trim(),
  };

  users.push(newUser);
  res.status(201).json(newUser);
};