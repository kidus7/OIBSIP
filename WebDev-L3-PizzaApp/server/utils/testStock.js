// server/utils/testStock.js
require('dotenv').config();
const mongoose = require('mongoose');
const { checkLowStock } = require('./stockChecker');

// Connect to MongoDB and trigger check immediately
mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB. Running stock checker...');
    await checkLowStock();
    console.log('Test execution complete. Closing connection.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);
  });