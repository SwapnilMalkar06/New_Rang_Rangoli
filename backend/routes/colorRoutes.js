const express = require('express');
const router = express.Router();
const {
  getAllColors,
  getColorById,
  updateColor,
  createColor,
  deleteColor,
  updateColorPrice,
  batchUpdatePricing
} = require('../controllers/colorController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route to list all colors and weights
// Admin route to create a new shade
router.route('/')
  .get(getAllColors)
  .post(protect, adminOnly, createColor);

// Batch pricing route MUST be defined before /:id so Express does not treat 'batch-pricing' as an ID
router.route('/batch-pricing')
  .post(protect, adminOnly, batchUpdatePricing);

// Quick price adjustment for a specific shade
router.route('/:id/price')
  .put(protect, adminOnly, updateColorPrice);

// Single color shade route: Public GET, Admin PUT / DELETE
router.route('/:id')
  .get(getColorById)
  .put(protect, adminOnly, updateColor)
  .delete(protect, adminOnly, deleteColor);

module.exports = router;
