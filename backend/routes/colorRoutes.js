const express = require('express');
const router = express.Router();
const {
  getAllColors,
  getColorById,
  updateColor,
  createColor,
  deleteColor
} = require('../controllers/colorController');
const { protect, adminOnly } = require('../middleware/auth');

// Public route to list all colors and weights
// Admin route to create a new shade
router.route('/')
  .get(getAllColors)
  .post(protect, adminOnly, createColor);

// Single color shade route: Public GET, Admin PUT / DELETE
router.route('/:id')
  .get(getColorById)
  .put(protect, adminOnly, updateColor)
  .delete(protect, adminOnly, deleteColor);

module.exports = router;
