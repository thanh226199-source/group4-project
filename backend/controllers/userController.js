// controllers/userController.js
let users = [
  { id: 1, name: "Nguyen Duy Thanh", email: "a@example.com" },
  { id: 2, name: "Nguyen Ngoc Thap", email: "b@example.com" },
];

exports.getUsers = (req, res) => {
  res.status(200).json(users);
};

exports.createUser = (req, res) => {
  const { name, email } = req.body;

  if (!name || !String(name).trim()) {
    return res.status(400).json({ message: "Name is required" });
  }

  if (!email || !/\S+@\S+\.\S+/.test(email)) {
    return res.status(400).json({ message: "Valid email is required" });
  }

  const id = Date.now();
  const newUser = { id, name: name.trim(), email: email.trim() };
  users.push(newUser);

  console.log("✅ Received user:", newUser);
  res.status(201).json(newUser);
};
