const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');

/**
 * @desc    Create a new order online
 * @route   POST /api/orders
 * @access  Public (Retailers or Customers)
 */
exports.createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, shippingAddress, items, isWholesale, totalPrice } = req.body;

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
      paymentStatus: 'Pending',
      fulfillmentStatus: 'Processing'
    });

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
