const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/User');
require('dotenv').config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  const passAdmin = await bcrypt.hash('Admin@123', 10);
  await User.create({ name: 'Admin', email: 'admin@example.com', password: passAdmin, role: 'admin' });
  const passUser = await bcrypt.hash('user123', 10);
  await User.create({ name: 'User A', email: 'usera@example.com', password: passUser });
  await User.create({ name: 'User B', email: 'userb@example.com', password: passUser });
  console.log('Seed done');
  process.exit(0);
}
seed().catch(console.error);
