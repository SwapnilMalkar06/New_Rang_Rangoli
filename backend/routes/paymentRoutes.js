const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyPayment,
  getRazorpayKey
} = require('../controllers/paymentController');

router.post('/create-order', createRazorpayOrder);
router.post('/verify', verifyPayment);
router.get('/key', getRazorpayKey);

module.exports = router;
