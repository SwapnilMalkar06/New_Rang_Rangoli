const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getMyOrders } = require('../controllers/orderController');
const { protect } = require('../middleware/auth');

router.route('/')
  .post(createOrder);

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/:id')
  .get(getOrderById);

module.exports = router;
