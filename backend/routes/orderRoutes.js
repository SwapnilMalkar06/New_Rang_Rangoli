const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  sendDeliveryOtp,
  verifyDeliveryOtp,
  deliveryBoyVerifyOtp
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOnly, getAllOrders)
  .post(createOrder);

router.route('/my-orders')
  .get(protect, getMyOrders);

// Doorstep delivery verification by delivery partner (Public, verified by 4-digit OTP)
router.post('/:id/delivery-verify', deliveryBoyVerifyOtp);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(protect, adminOnly, updateOrderStatus);

router.route('/:id/send-delivery-otp')
  .post(protect, adminOnly, sendDeliveryOtp);

module.exports = router;
