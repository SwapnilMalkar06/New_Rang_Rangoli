const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const whatsappService = require('../services/whatsappService');

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

    // Create the order
    const order = await Order.create({
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress,
      items: validatedItems,
      totalPrice: finalTotal,
      paymentStatus: paymentMethod === 'Online' || paymentMethod === 'Razorpay' ? 'Pending' : 'Pending',
      paymentMethod: paymentMethod || 'COD',
      fulfillmentStatus: 'Processing'
    });

    // Send instant WhatsApp order confirmation to customer
    try {
      const waResult = await whatsappService.sendOrderConfirmation(order);
      if (waResult) {
        order.whatsappLogs.push({
          type: 'ORDER_CONFIRMATION',
          phone: order.customerPhone,
          message: 'Order confirmation dispatched via WhatsApp',
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
    const orders = await Order.find({ customerEmail: req.user.email })
      .sort({ createdAt: -1 });

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
            message: 'Delivery OTP is compulsory! The delivery partner must enter the 6-digit OTP sent to the customer’s WhatsApp to confirm delivery.'
          });
        }

        if (!order.deliveryOtp || !order.deliveryOtp.code) {
          return res.status(400).json({
            success: false,
            message: 'No Delivery OTP was generated yet. Please generate and send the Delivery OTP to the customer on WhatsApp first.'
          });
        }

        if (suppliedOtp !== String(order.deliveryOtp.code).trim()) {
          order.deliveryOtp.attempts = (order.deliveryOtp.attempts || 0) + 1;
          await order.save();
          return res.status(400).json({
            success: false,
            message: 'Invalid Delivery OTP! Please enter the exact 6-digit OTP received on the customer’s WhatsApp.'
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
      // Auto-generate fresh 6-digit delivery OTP if not already active
      if (!order.deliveryOtp?.code || order.deliveryOtp?.isVerified) {
        const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
        order.deliveryOtp = {
          code: generatedCode,
          generatedAt: new Date(),
          isVerified: false,
          attempts: 0
        };
      }

      await order.save();

      try {
        const otpResult = await whatsappService.sendDeliveryOtp(order, order.deliveryOtp.code);
        order.whatsappLogs.push({
          type: 'DELIVERY_OTP',
          phone: order.customerPhone,
          message: `Delivery OTP (${order.deliveryOtp.code}) sent via WhatsApp`,
          sentAt: new Date(),
          isSimulated: !!otpResult?.simulated
        });
      } catch (err) {
        console.error('Failed to send Delivery OTP via WhatsApp:', err.message);
      }
    } else if (statusChanged) {
      if (fulfillmentStatus === 'Delivered') {
        try {
          const delResult = await whatsappService.sendDeliveryConfirmed(order);
          order.whatsappLogs.push({
            type: 'DELIVERY_CONFIRMATION',
            phone: order.customerPhone,
            message: 'Order delivery confirmed via WhatsApp after OTP verification',
            sentAt: new Date(),
            isSimulated: !!delResult?.simulated
          });
        } catch (err) {
          console.error('Failed to send Delivery confirmation WhatsApp:', err.message);
        }
      } else {
        // Shipped, Processing, Ready-for-Pickup, Cancelled
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
 * @desc    Generate and send/resend Delivery OTP to customer's WhatsApp
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

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    order.deliveryOtp = {
      code: otpCode,
      generatedAt: new Date(),
      isVerified: false,
      attempts: 0
    };

    // Promote to 'Out for Delivery' automatically
    if (order.fulfillmentStatus === 'Processing' || order.fulfillmentStatus === 'Shipped') {
      order.fulfillmentStatus = 'Out for Delivery';
    }

    const waResult = await whatsappService.sendDeliveryOtp(order, otpCode);

    order.whatsappLogs.push({
      type: 'DELIVERY_OTP',
      phone: order.customerPhone,
      message: `Delivery OTP (${otpCode}) sent to customer WhatsApp (+${order.customerPhone})`,
      sentAt: new Date(),
      isSimulated: !!waResult?.simulated
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: `Delivery OTP (${otpCode}) sent to customer WhatsApp (+${order.customerPhone})`,
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
 * @desc    Verify delivery OTP entered by delivery person / admin to confirm delivery
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

    const cleanInputOtp = String(otp).trim();
    const cleanOrderOtp = String(order.deliveryOtp.code).trim();

    if (cleanInputOtp !== cleanOrderOtp) {
      order.deliveryOtp.attempts = (order.deliveryOtp.attempts || 0) + 1;
      await order.save();
      return res.status(400).json({
        success: false,
        message: 'Incorrect Delivery OTP! Please check the 6-digit code received on the customer’s WhatsApp.'
      });
    }

    // Success: Mark verified and delivered
    order.deliveryOtp.isVerified = true;
    order.deliveryOtp.verifiedAt = new Date();
    order.fulfillmentStatus = 'Delivered';

    if (markPaymentPaid || order.paymentMethod === 'COD') {
      order.paymentStatus = 'Paid';
    }

    const waResult = await whatsappService.sendDeliveryConfirmed(order);

    order.whatsappLogs.push({
      type: 'DELIVERY_CONFIRMATION',
      phone: order.customerPhone,
      message: 'Delivery confirmed & verified with OTP',
      sentAt: new Date(),
      isSimulated: !!waResult?.simulated
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Delivery successfully verified with OTP and marked as Delivered!',
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
