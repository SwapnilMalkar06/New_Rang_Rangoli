const express = require('express');
const router = express.Router();
const { getProducts, createProduct, updateStock, getProductById } = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route to search & filter products
// Admin-only route to create new products
router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, createProduct);

// Public route to get single product details
router.route('/:id')
  .get(getProductById);

// Admin/System route to update stock levels atomically
router.route('/:id/stock')
  .put(protect, adminOnly, updateStock);

module.exports = router;
