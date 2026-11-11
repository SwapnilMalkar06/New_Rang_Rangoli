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
  deliveryBoyVerifyOtp,
  getDeliveryRuns,
  startDeliveryRun
} = require('../controllers/orderController');
const { protect, adminOnly, deliveryOrAdminOnly } = require('../middleware/auth');

router.route('/')
  .get(protect, adminOnly, getAllOrders)
  .post(createOrder);

router.route('/my-orders')
  .get(protect, getMyOrders);

// Delivery partner dashboard runs list
router.route('/delivery/runs')
  .get(protect, deliveryOrAdminOnly, getDeliveryRuns);

// Delivery partner updates status to Out for Delivery & triggers OTP
router.route('/:id/start-delivery')
  .put(protect, deliveryOrAdminOnly, startDeliveryRun);

// Doorstep delivery verification by delivery partner (Public, verified by 4-digit OTP)
router.post('/:id/delivery-verify', deliveryBoyVerifyOtp);

router.route('/:id')
  .get(getOrderById);

router.route('/:id/status')
  .put(protect, adminOnly, updateOrderStatus);

router.route('/:id/send-delivery-otp')
  .post(protect, adminOnly, sendDeliveryOtp);

module.exports = router;
