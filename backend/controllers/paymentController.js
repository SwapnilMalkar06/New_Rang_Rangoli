const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/payment/create-order
 * @access  Public
 */
exports.createRazorpayOrder = async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid amount in INR is required'
      });
    }

    const amountInPaise = Math.round(Number(amount) * 100);

    // If live/test Razorpay keys are not configured or are placeholder, provide simulated order for testing
    if (!keyId || !keySecret || keyId === 'rzp_test_placeholder' || keyId.trim() === '') {
      return res.status(200).json({
        success: true,
        isSimulated: true,
        orderId: `order_sim_${Date.now()}`,
        amount: amountInPaise,
        currency: 'INR',
        keyId: keyId || 'rzp_test_sandboxKey'
      });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    });

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: receipt || `rcpt_${Date.now()}`
    };

    const order = await instance.orders.create(options);

    res.status(200).json({
      success: true,
      isSimulated: false,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: keyId
    });
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order',
      error: error.message
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature & update order
 * @route   POST /api/payment/verify
 * @access  Public
 */
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId
    } = req.body;

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Check if this was a simulated order
    const isSimulated = razorpay_order_id && razorpay_order_id.startsWith('order_sim_');

    if (!isSimulated && keySecret && keySecret !== 'rzp_secret_placeholder') {
      const generatedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return res.status(400).json({
          success: false,
          message: 'Payment verification failed: Invalid Razorpay signature'
        });
      }
    }

    if (orderId) {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        {
          paymentStatus: 'Paid',
          transactionId: razorpay_payment_id || `txn_${Date.now()}`,
          paymentMethod: 'Razorpay'
        },
        { new: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        data: updatedOrder
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payment signature verified successfully'
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying payment',
      error: error.message
    });
  }
};

/**
 * @desc    Get Razorpay Public Key
 * @route   GET /api/payment/key
 * @access  Public
 */
exports.getRazorpayKey = (req, res) => {
  res.status(200).json({
    keyId: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder'
  });
};
