const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const whatsappWebService = require('../services/whatsappWebService');

/**
 * @desc    Get aggregate analytics and KPI statistics for the Admin Dashboard
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getAdminStats = async (req, res) => {
  try {
    // 1. Order and Revenue metrics
    const [
      totalOrders,
      ordersByFulfillment,
      ordersByPayment,
      revenueResult,
      recentOrders
    ] = await Promise.all([
      Order.countDocuments(),
      Order.aggregate([
        { $group: { _id: '$fulfillmentStatus', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        { $group: { _id: '$paymentStatus', count: { $sum: 1 } } }
      ]),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'Paid'] }, '$totalPrice', 0]
              }
            },
            grossSales: { $sum: '$totalPrice' }
          }
        }
      ]),
      Order.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .lean()
    ]);

    // 2. Product metrics
    const [totalProducts, lowStockProducts, outOfStockCount] = await Promise.all([
      Product.countDocuments(),
      Product.find({ stockQuantity: { $lte: 20 } })
        .sort({ stockQuantity: 1 })
        .limit(10)
        .select('name nameMR mainCategory price wholesalePrice stockQuantity imageUrls')
        .lean(),
      Product.countDocuments({ stockQuantity: { $lte: 0 } })
    ]);

    // 3. User metrics
    const [totalUsers, usersByRole, recentUsers] = await Promise.all([
      User.countDocuments(),
      User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(6)
        .select('-password')
        .lean()
    ]);

    // Format fulfillment dictionary
    const fulfillmentMap = {
      Processing: 0,
      Shipped: 0,
      'Out for Delivery': 0,
      Delivered: 0,
      'Ready-for-Pickup': 0,
      Cancelled: 0
    };
    ordersByFulfillment.forEach(item => {
      if (item._id) fulfillmentMap[item._id] = item.count;
    });

    // Format payment dictionary
    const paymentMap = {
      Paid: 0,
      Pending: 0,
      Failed: 0
    };
    ordersByPayment.forEach(item => {
      if (item._id) paymentMap[item._id] = item.count;
    });

    // Format roles dictionary
    const rolesMap = {
      customer: 0,
      retailer: 0,
      admin: 0
    };
    usersByRole.forEach(item => {
      if (item._id) rolesMap[item._id] = item.count;
    });

    const revenue = (revenueResult[0] && revenueResult[0].totalRevenue) || 0;
    const grossSales = (revenueResult[0] && revenueResult[0].grossSales) || 0;

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalRevenue: Math.round(revenue * 100) / 100,
          grossSales: Math.round(grossSales * 100) / 100,
          totalOrders,
          totalProducts,
          totalUsers,
          retailersCount: rolesMap.retailer || 0,
          customersCount: rolesMap.customer || 0,
          outOfStockCount,
          lowStockCount: lowStockProducts.length
        },
        fulfillmentMap,
        paymentMap,
        rolesMap,
        lowStockProducts,
        recentOrders,
        recentUsers
      }
    });
  } catch (error) {
    console.error('Error computing admin statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compute dashboard metrics',
      error: error.message
    });
  }
};

/**
 * @desc    Get all registered users with role and search filters
 * @route   GET /api/admin/users
 * @access  Private/Admin
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = role;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { phone: regex },
        { businessName: regex },
        { gstin: regex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, parseInt(limit, 10) || 50);
    const skip = (pageNum - 1) * limitNum;

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    res.status(200).json({
      success: true,
      count: users.length,
      pagination: {
        totalUsers,
        totalPages: Math.ceil(totalUsers / limitNum) || 1,
        currentPage: pageNum,
        limit: limitNum
      },
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user accounts',
      error: error.message
    });
  }
};

/**
 * @desc    Change user role (e.g. promote customer to retailer or admin)
 * @route   PUT /api/admin/users/:id/role
 * @access  Private/Admin
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['customer', 'retailer', 'admin'];

    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role specified. Allowed values: ${validRoles.join(', ')}`
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { role } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    res.status(200).json({
      success: true,
      message: `User role successfully updated to ${role}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
};

/**
 * @desc    Get live WhatsApp Web connection status & QR code for Kishor Jamdade (+91 70576 17451)
 * @route   GET /api/admin/whatsapp/status
 * @access  Private/Admin
 */
exports.getWhatsAppStatus = async (req, res) => {
  try {
    const statusData = whatsappWebService.getStatus();
    res.status(200).json({
      success: true,
      data: statusData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve WhatsApp Web status',
      error: error.message
    });
  }
};

/**
 * @desc    Restart WhatsApp Web service
 * @route   POST /api/admin/whatsapp/restart
 * @access  Private/Admin
 */
exports.restartWhatsAppClient = async (req, res) => {
  try {
    const statusData = await whatsappWebService.restart();
    res.status(200).json({
      success: true,
      message: 'WhatsApp Web service restart initiated',
      data: statusData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to restart WhatsApp Web service',
      error: error.message
    });
  }
};

/**
 * @desc    Logout WhatsApp Web session and generate fresh QR
 * @route   POST /api/admin/whatsapp/logout
 * @access  Private/Admin
 */
exports.logoutWhatsAppClient = async (req, res) => {
  try {
    const statusData = await whatsappWebService.logout();
    res.status(200).json({
      success: true,
      message: 'WhatsApp Web session disconnected and fresh QR generated',
      data: statusData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to disconnect WhatsApp Web session',
      error: error.message
    });
  }
};
