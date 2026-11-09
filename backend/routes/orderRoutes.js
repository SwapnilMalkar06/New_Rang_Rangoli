const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrderById,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  sendDeliveryOtp,
  verifyDeliveryOtp
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOnly, getAllOrders)
  .post(createOrder);

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(protect, adminOnly, updateOrderStatus);

router.route('/:id/send-delivery-otp')
  .post(protect, adminOnly, sendDeliveryOtp);

router.route('/:id/verify-delivery')
  .post(protect, adminOnly, verifyDeliveryOtp);

module.exports = router;
