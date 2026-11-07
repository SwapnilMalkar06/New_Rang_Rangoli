require('dotenv').config();
const connectDB = require('../backend/config/db');
const app = require('../backend/server');
const Product = require('../backend/models/Product');

let seeded = false;

module.exports = async (req, res) => {
  try {
    await connectDB();
    if (!seeded) {
      const count = await Product.countDocuments();
      if (count < 18 && app.seedProducts) {
        await app.seedProducts();
      }
      if (app.seedAdmin) {
        await app.seedAdmin();
      }
      seeded = true;
    }
  } catch (error) {
    console.error('Failed to connect to database in serverless function:', error);
  }
  return app(req, res);
};
