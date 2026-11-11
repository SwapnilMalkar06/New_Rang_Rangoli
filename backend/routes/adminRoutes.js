const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getWhatsAppStatus,
  restartWhatsAppClient,
  logoutWhatsAppClient
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Protect and require admin privileges for all admin routes
router.use(protect, adminOnly);

// Aggregate KPI & Overview Analytics
router.get('/stats', getAdminStats);

// User and Wholesale Retailer Account Management
router.get('/users', getAllUsers);
router.put('/users/:id/role', updateUserRole);

// WhatsApp Web Service & QR Pairing for Kishor Jamdade (+91 70576 17451)
router.get('/whatsapp/status', getWhatsAppStatus);
router.post('/whatsapp/restart', restartWhatsAppClient);
router.post('/whatsapp/logout', logoutWhatsAppClient);

module.exports = router;
