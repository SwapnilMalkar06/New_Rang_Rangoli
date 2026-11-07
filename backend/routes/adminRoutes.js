const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserRole
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Protect and require admin privileges for all admin routes
router.use(protect, adminOnly);

// Aggregate KPI & Overview Analytics
router.get('/stats', getAdminStats);

// User and Wholesale Retailer Account Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
