const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const whatsappService = require('../services/whatsappService');
const whatsappWebService = require('../services/whatsappWebService');

/**
 * @desc    Create a new order online
 * @route   POST /api/orders
 * @access  Public (Retailers or Customers)
 */
exports.createOrder = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items,
      isWholesale,
      totalPrice,
      paymentMethod = 'COD'
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must contain at least one item'
      });
    }

    let calculatedTotal = 0;
    const validatedItems = [];

    // Loop through items and validate
    for (const item of items) {
      const prodId = item.productId || item.product;
      const isValidObjectId = prodId && mongoose.Types.ObjectId.isValid(prodId) && String(new mongoose.Types.ObjectId(prodId)) === String(prodId);

      let product = null;
      if (isValidObjectId) {
        try {
          product = await Product.findById(prodId);
        } catch (e) {
          product = null;
        }
      }

      let priceUsed = item.price != null ? Number(item.price) : null;
      let itemName = item.name || 'Rangoli Item';
      let itemNameMR = item.nameMR || '';
      let itemImage = item.image || '';

      if (product) {
        itemName = product.name;
        itemNameMR = product.nameMR || '';
        itemImage = (product.imageUrls && product.imageUrls[0]) || product.image || itemImage;

        // Check stock if tracked
        if (product.stockQuantity != null && product.stockQuantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}. Available: ${product.stockQuantity}, Requested: ${item.quantity}`
          });
        }

        // If price not provided in item, derive from DB
        if (priceUsed == null || isNaN(priceUsed)) {
          if (isWholesale) {
            if (item.quantity < (product.minWholesaleQuantity || 1)) {
              return res.status(400).json({
                success: false,
                message: `Wholesale order for "${product.name}" does not meet minimum quantity of ${product.minWholesaleQuantity}.`
              });
            }
            priceUsed = product.wholesalePrice;
          } else {
            priceUsed = product.currentPrice || product.price;
          }
        }

        // Deduct stock levels atomically
        await Product.findByIdAndUpdate(product._id, {
          $inc: { stockQuantity: -item.quantity }
        });
      }

      // Safe fallback for price
      if (priceUsed == null || isNaN(priceUsed) || priceUsed < 0) {
        priceUsed = 6;
      }

      calculatedTotal += priceUsed * item.quantity;
      validatedItems.push({
        productId: String(prodId || ''),
        product: product ? product._id : null,
        name: itemName,
        nameMR: itemNameMR,
        selectedWeight: item.selectedWeight || '',
        image: itemImage,
        quantity: item.quantity,
        priceAtPurchase: priceUsed
      });
    }

    // Determine final total
    const finalTotal = (totalPrice && !isNaN(totalPrice) && Number(totalPrice) > 0)
      ? Number(totalPrice)
      : Math.round(calculatedTotal * 100) / 100;

    // Generate secure 4-digit Delivery OTP and 24-hour expiration window
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    // Create the order with 4-digit OTP pre-initialized
    const order = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: validatedItems,
      totalPrice: finalTotal,
      paymentStatus: paymentMethod === 'Online' || paymentMethod === 'Razorpay' ? 'Pending' : 'Pending',
      paymentMethod: paymentMethod || 'COD',
      fulfillmentStatus: 'Processing',
      deliveryOtp: {
        code: otpCode,
        generatedAt: new Date(),
        expiresAt: expiresAt,
        isVerified: false,
        attempts: 0,
        maxAttempts: 5
      }
    });

    // Send instant WhatsApp order summary + 4-digit OTP to Customer and Alert to Kishor Jamdade
    try {
      const waResult = await whatsappWebService.sendOrderSummaryAndOtp(order, otpCode);
      if (waResult) {
        order.whatsappLogs.push({
          type: 'ORDER_CONFIRMATION_AND_OTP',
          phone: order.customerPhone,
          message: `Order summary and 4-digit OTP (${otpCode}) dispatched via WhatsApp (Kishor Jamdade)`,
          sentAt: new Date(),
          isSimulated: !!waResult.simulated
        });
        await order.save();
      }
    } catch (waErr) {
      console.error('Non-blocking WhatsApp order confirmation error:', waErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      success: false,
      message: 'Server error processing order placement',
      error: error.message
    });
  }
};

/**
 * @desc    Get logged-in user's orders
 * @route   GET /api/orders/my-orders
 * @access  Private
 */
exports.getMyOrders = async (req, res) => {
  try {
    const userEmail = (req.user.email || '').trim();
    const userPhone = (req.user.phone || '').trim();

    const queryConditions = [];
    if (userEmail) {
      queryConditions.push({ customerEmail: new RegExp(`^${userEmail}$`, 'i') });
    }
    if (userPhone) {
      queryConditions.push({ customerPhone: userPhone });
    }

    const query = queryConditions.length > 0 ? { $or: queryConditions } : { customerEmail: userEmail };
    const orders = await Order.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving your orders',
      error: error.message
    });
  }
};

/**
 * @desc    Get order details
 * @route   GET /api/orders/:id
 * @access  Public
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving order',
      error: error.message
    });
  }
};

/**
 * @desc    Get all orders (Admin only) with pagination, search, and filtering
 * @route   GET /api/orders
 * @access  Private/Admin
 */
exports.getAllOrders = async (req, res) => {
  try {
    const { fulfillmentStatus, paymentStatus, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (fulfillmentStatus && fulfillmentStatus !== 'All') {
      query.fulfillmentStatus = fulfillmentStatus;
    }
    if (paymentStatus && paymentStatus !== 'All') {
      query.paymentStatus = paymentStatus;
    }
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { customerName: searchRegex },
        { customerEmail: searchRegex },
        { customerPhone: searchRegex },
        { shippingAddress: searchRegex },
        { transactionId: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const totalOrders = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: orders.length,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limitNum) || 1,
        currentPage: pageNum,
        limit: limitNum
      },
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving all orders',
      error: error.message
    });
  }
};

/**
 * @desc    Update order fulfillment and/or payment status
 * @route   PUT /api/orders/:id/status
 * @access  Private/Admin
 */
exports.updateOrderStatus = async (req, res) => {
  try {
    const { fulfillmentStatus, paymentStatus, deliveryOtp, customNote } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const validFulfillment = ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Ready-for-Pickup', 'Cancelled'];
    if (fulfillmentStatus && !validFulfillment.includes(fulfillmentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid fulfillment status. Allowed: ${validFulfillment.join(', ')}`
      });
    }

    const validPayment = ['Pending', 'Paid', 'Failed'];
    if (paymentStatus && !validPayment.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid payment status. Allowed: ${validPayment.join(', ')}`
      });
    }

    // MANDATORY OTP VALIDATION TO MARK AS DELIVERED
    if (fulfillmentStatus === 'Delivered' && order.fulfillmentStatus !== 'Delivered') {
      const isAlreadyVerified = order.deliveryOtp && order.deliveryOtp.isVerified;
      const suppliedOtp = (deliveryOtp || req.body.otp) ? String(deliveryOtp || req.body.otp).trim() : null;

      if (!isAlreadyVerified) {
        if (!suppliedOtp) {
          return res.status(400).json({
            success: false,
            message: 'Delivery OTP is compulsory! The delivery partner must enter the 4-digit OTP sent to the customer’s WhatsApp to confirm delivery.'
          });
        }

        if (!order.deliveryOtp || !order.deliveryOtp.code) {
          return res.status(400).json({
            success: false,
            message: 'No Delivery OTP was generated yet. Please generate and send the Delivery OTP to the customer on WhatsApp first.'
          });
        }

        // Check if max attempts (5) exceeded
        if ((order.deliveryOtp.attempts || 0) >= (order.deliveryOtp.maxAttempts || 5)) {
          return res.status(400).json({
            success: false,
            message: 'Maximum OTP verification attempts (5) exceeded! Please resend a new 4-digit OTP to the customer.'
          });
        }

        // Check if 24-hour expiration window passed
        if (order.deliveryOtp.expiresAt && new Date() > new Date(order.deliveryOtp.expiresAt)) {
          return res.status(400).json({
            success: false,
            message: 'Delivery OTP has expired! Please click "Resend OTP" to issue a fresh 4-digit OTP.'
          });
        }

        if (suppliedOtp !== String(order.deliveryOtp.code).trim()) {
          order.deliveryOtp.attempts = (order.deliveryOtp.attempts || 0) + 1;
          await order.save();
          const remainingAttempts = Math.max(0, (order.deliveryOtp.maxAttempts || 5) - order.deliveryOtp.attempts);
          return res.status(400).json({
            success: false,
            message: `Invalid Delivery OTP! ${remainingAttempts} attempt(s) remaining.`
          });
        }

        // OTP Verified successfully!
        order.deliveryOtp.isVerified = true;
        order.deliveryOtp.verifiedAt = new Date();
      }
    }

    let statusChanged = false;
    const previousStatus = order.fulfillmentStatus;

    if (fulfillmentStatus && fulfillmentStatus !== order.fulfillmentStatus) {
      order.fulfillmentStatus = fulfillmentStatus;
      statusChanged = true;
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    // Trigger WhatsApp Notifications according to status transition
    if (fulfillmentStatus === 'Out for Delivery') {
      // Auto-generate fresh 4-digit delivery OTP if not already active or if expired
      const isExpired = order.deliveryOtp?.expiresAt && new Date() > new Date(order.deliveryOtp.expiresAt);
      if (!order.deliveryOtp?.code || order.deliveryOtp?.isVerified || isExpired) {
        const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
        order.deliveryOtp = {
          code: generatedCode,
          generatedAt: new Date(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          isVerified: false,
          attempts: 0,
          maxAttempts: 5
        };
      }

      await order.save();

      try {
        const otpResult = await whatsappWebService.sendDeliveryOtp(order, order.deliveryOtp.code);
        order.whatsappLogs.push({
          type: 'DELIVERY_OTP',
          phone: order.customerPhone,
          message: `Delivery OTP (${order.deliveryOtp.code}) sent via WhatsApp (Kishor Jamdade)`,
          sentAt: new Date(),
          isSimulated: !!otpResult?.simulated
        });
      } catch (err) {
        console.error('Failed to send Delivery OTP via WhatsApp:', err.message);
      }
    } else if (statusChanged) {
      if (fulfillmentStatus === 'Shipped') {
        // AUTOMATIC DISPATCH NOTIFICATION BY DEFAULT
        try {
          const dispatchResult = await whatsappWebService.sendDispatchedNotification(order);
          order.whatsappLogs.push({
            type: 'PARCEL_DISPATCHED',
            phone: order.customerPhone,
            message: 'Parcel dispatched notification sent via WhatsApp',
            sentAt: new Date(),
            isSimulated: !!dispatchResult?.simulated
          });
        } catch (err) {
          console.error('Failed to send Dispatched WhatsApp notification:', err.message);
        }
      } else if (fulfillmentStatus === 'Delivered') {
        try {
          const delResult = await whatsappWebService.sendDeliveryConfirmed(order);
          order.whatsappLogs.push({
            type: 'DELIVERY_CONFIRMATION',
            phone: order.customerPhone,
            message: 'Order delivery confirmed via WhatsApp after 4-digit OTP verification',
            sentAt: new Date(),
            isSimulated: !!delResult?.simulated
          });
        } catch (err) {
          console.error('Failed to send Delivery confirmation WhatsApp:', err.message);
        }
      } else {
        // Processing, Ready-for-Pickup, Cancelled
        try {
          const statusResult = await whatsappService.sendStatusUpdate(order, fulfillmentStatus, customNote);
          order.whatsappLogs.push({
            type: 'STATUS_UPDATE',
            phone: order.customerPhone,
            message: `Order status updated from ${previousStatus} to ${fulfillmentStatus}`,
            sentAt: new Date(),
            isSimulated: !!statusResult?.simulated
          });
        } catch (err) {
          console.error('Failed to send WhatsApp status update:', err.message);
        }
      }
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating order status',
      error: error.message
    });
  }
};

/**
 * @desc    Generate and send/resend 4-digit Delivery OTP to customer's WhatsApp
 * @route   POST /api/orders/:id/send-delivery-otp
 * @access  Private/Admin
 */
exports.sendDeliveryOtp = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.fulfillmentStatus === 'Delivered' && order.deliveryOtp?.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This order has already been verified and delivered.'
      });
    }

    // Generate fresh uniform 4-digit code (1000-9999) with 24-hour expiration
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    order.deliveryOtp = {
      code: otpCode,
      generatedAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isVerified: false,
      attempts: 0,
      maxAttempts: 5
    };

    // Promote to 'Out for Delivery' automatically
    if (order.fulfillmentStatus === 'Processing' || order.fulfillmentStatus === 'Shipped') {
      order.fulfillmentStatus = 'Out for Delivery';
    }

    const waResult = await whatsappWebService.sendDeliveryOtp(order, otpCode);

    order.whatsappLogs.push({
      type: 'DELIVERY_OTP',
      phone: order.customerPhone,
      message: `4-Digit Delivery OTP (${otpCode}) resent to customer WhatsApp (+${order.customerPhone})`,
      sentAt: new Date(),
      isSimulated: !!waResult?.simulated
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `4-Digit Delivery OTP (${otpCode}) sent to customer WhatsApp (+${order.customerPhone})`,
      data: order,
      simulated: !!waResult?.simulated
    });
  } catch (error) {
    console.error('Error sending delivery OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send delivery OTP',
      error: error.message
    });
  }
};

/**
 * @desc    Verify 4-digit delivery OTP entered by delivery person / admin to confirm delivery
 * @route   POST /api/orders/:id/verify-delivery
 * @access  Private/Admin
 */
exports.verifyDeliveryOtp = async (req, res) => {
  try {
    const { otp, markPaymentPaid } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Delivery OTP is required to confirm delivery.'
      });
    }

    const cleanInputOtp = String(otp).trim();
    if (!/^\d{4}$/.test(cleanInputOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 4-digit numeric OTP.'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.fulfillmentStatus === 'Delivered' && order.deliveryOtp?.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'This order is already delivered and verified with OTP.',
        data: order
      });
    }

    if (!order.deliveryOtp || !order.deliveryOtp.code) {
      return res.status(400).json({
        success: false,
        message: 'No OTP has been sent for this order yet. Please click "Send Delivery OTP" first.'
      });
    }

    // Check attempts lockout
    if ((order.deliveryOtp.attempts || 0) >= (order.deliveryOtp.maxAttempts || 5)) {
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP verification attempts (5) reached! Please click "Resend OTP" to generate a fresh 4-digit code.'
      });
    }

    // Check 24-hour expiration window
    if (order.deliveryOtp.expiresAt && new Date() > new Date(order.deliveryOtp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'This Delivery OTP has expired (valid for 24 hours). Please click "Resend OTP" to issue a new code.'
      });
    }

    const cleanOrderOtp = String(order.deliveryOtp.code).trim();

    if (cleanInputOtp !== cleanOrderOtp) {
      order.deliveryOtp.attempts = (order.deliveryOtp.attempts || 0) + 1;
      await order.save();
      const remainingAttempts = Math.max(0, (order.deliveryOtp.maxAttempts || 5) - order.deliveryOtp.attempts);
      return res.status(400).json({
        success: false,
        message: `Incorrect 4-Digit Delivery OTP! ${remainingAttempts} attempt(s) remaining.`
      });
    }

    // Success: Mark verified and delivered
    order.deliveryOtp.isVerified = true;
    order.deliveryOtp.verifiedAt = new Date();
    order.fulfillmentStatus = 'Delivered';

    if (markPaymentPaid || order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    const waResult = await whatsappWebService.sendDeliveryConfirmed(order);

    order.whatsappLogs.push({
      type: 'DELIVERY_CONFIRMATION',
      phone: order.customerPhone,
      message: 'Delivery confirmed & verified with 4-digit OTP',
      sentAt: new Date(),
      isSimulated: !!waResult?.simulated
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Delivery successfully verified with 4-digit OTP and marked as Delivered!',
      data: order
    });
  } catch (error) {
    console.error('Error verifying delivery OTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error verifying delivery',
      error: error.message
    });
  }
};

/**
 * @desc    Doorstep Delivery Verification by Delivery Partner (Public endpoint)
 * @route   POST /api/orders/:id/delivery-verify
 * @access  Public (Authorized by Secret 4-Digit OTP)
 */
exports.deliveryBoyVerifyOtp = async (req, res) => {
  try {
    const { otp, markPaymentPaid = true } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: 'Please enter the 4-digit Delivery OTP provided by the customer at the doorstep.'
      });
    }

    const cleanInputOtp = String(otp).trim();
    if (!/^\d{4}$/.test(cleanInputOtp)) {
      return res.status(400).json({
        success: false,
        message: 'Delivery OTP must be exactly 4 numeric digits.'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.fulfillmentStatus === 'Delivered' && order.deliveryOtp?.isVerified) {
      return res.status(200).json({
        success: true,
        message: 'This order is already delivered and verified with OTP.',
        data: order
      });
    }

    if (!order.deliveryOtp || !order.deliveryOtp.code) {
      return res.status(400).json({
        success: false,
        message: 'Delivery OTP has not been issued yet. The parcel must be Out for Delivery.'
      });
    }

    // Check attempts limit
    if ((order.deliveryOtp.attempts || 0) >= (order.deliveryOtp.maxAttempts || 5)) {
      return res.status(400).json({
        success: false,
        message: 'Maximum OTP verification attempts (5) reached! Please ask workshop to re-issue OTP.'
      });
    }

    // Check expiration window (24 hours)
    if (order.deliveryOtp.expiresAt && new Date() > new Date(order.deliveryOtp.expiresAt)) {
      return res.status(400).json({
        success: false,
        message: 'This Delivery OTP has expired after 24 hours. Please contact workshop to resend.'
      });
    }

    const cleanOrderOtp = String(order.deliveryOtp.code).trim();

    if (cleanInputOtp !== cleanOrderOtp) {
      order.deliveryOtp.attempts = (order.deliveryOtp.attempts || 0) + 1;
      await order.save();
      const remainingAttempts = Math.max(0, (order.deliveryOtp.maxAttempts || 5) - order.deliveryOtp.attempts);
      return res.status(400).json({
        success: false,
        message: `Incorrect 4-Digit Delivery OTP! ${remainingAttempts} attempt(s) remaining.`
      });
    }

    // Success: Delivery Partner verified the OTP at doorstep!
    order.deliveryOtp.isVerified = true;
    order.deliveryOtp.verifiedAt = new Date();
    order.fulfillmentStatus = 'Delivered';

    // Mark COD or requested payment as Paid
    if (markPaymentPaid || order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    // Notify customer on WhatsApp AND send instant alert to Admin Kishor Jamdade
    const waResult = await whatsappWebService.sendDeliveryConfirmed(order);

    order.whatsappLogs.push({
      type: 'DELIVERY_BOY_VERIFIED',
      phone: order.customerPhone,
      message: 'Delivery partner verified 4-digit OTP at doorstep. Admin Kishor Jamdade notified.',
      sentAt: new Date(),
      isSimulated: !!waResult?.simulated
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Doorstep Delivery verified successfully! Order marked as Delivered and payment confirmed.',
      data: order
    });
  } catch (error) {
    console.error('Error verifying delivery by delivery partner:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during doorstep delivery verification',
      error: error.message
    });
  }
};

/**
 * @desc    Get orders for delivery partner dashboard
 * @route   GET /api/orders/delivery/runs
 * @access  Private/Delivery or Admin
 */
exports.getDeliveryRuns = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status && status !== 'All') {
      query.fulfillmentStatus = status;
    } else {
      query.fulfillmentStatus = { $in: ['Shipped', 'Out for Delivery', 'Delivered'] };
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { shippingAddress: searchRegex }
      ];
      if (mongoose.Types.ObjectId.isValid(search.trim())) {
        query.$or.push({ _id: search.trim() });
      }
    }

    const orders = await Order.find(query).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching delivery runs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving delivery runs',
      error: error.message
    });
  }
};

/**
 * @desc    Delivery partner updates status to "Out for Delivery" & dispatches 4-digit OTP
 * @route   PUT /api/orders/:id/start-delivery
 * @access  Private/Delivery or Admin
 */
exports.startDeliveryRun = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.fulfillmentStatus === 'Delivered') {
      return res.status(400).json({
        success: false,
        message: 'Order is already delivered and verified.'
      });
    }

    // Auto-generate fresh 4-digit delivery OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expiry

    order.fulfillmentStatus = 'Out for Delivery';
    order.deliveryOtp = {
      code: generatedOtp,
      generatedAt: new Date(),
      expiresAt: expiresAt,
      isVerified: false,
      attempts: 0,
      maxAttempts: 5
    };

    // Send 4-digit OTP WhatsApp message automatically to customer
    try {
      const waResult = await whatsappWebService.sendDeliveryOtp(order, generatedOtp);
      order.whatsappLogs.push({
        type: 'DELIVERY_RUN_STARTED',
        phone: order.customerPhone,
        message: `Delivery partner started delivery run. 4-Digit OTP (${generatedOtp}) sent to customer WhatsApp.`,
        sentAt: new Date(),
        isSimulated: !!waResult?.simulated
      });
    } catch (waErr) {
      console.error('Failed to send Delivery OTP on start run:', waErr.message);
    }

    await order.save();

    res.status(200).json({
      success: true,
      message: `Delivery run started! 4-Digit OTP (${generatedOtp}) automatically sent to customer WhatsApp (+${order.customerPhone}).`,
      data: order
    });
  } catch (error) {
    console.error('Error starting delivery run:', error);
    res.status(500).json({
      success: false,
      message: 'Server error starting delivery run',
      error: error.message
    });
  }
};
