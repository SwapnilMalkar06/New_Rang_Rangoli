const connectDB = require('../backend/config/db');
const app = require('../backend/server');

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to database in serverless function:', error);
  }
  return app(req, res);
};
