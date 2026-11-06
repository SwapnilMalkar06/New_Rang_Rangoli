const mongoose = require('mongoose');

const Schema = mongoose.Schema;

// Sub-schema for seasonal discount management
const SeasonalDiscountSchema = new Schema({
  discountPercentage: {
    type: Number,
    required: true,
    min: [0, 'Discount percentage cannot be less than 0'],
    max: [100, 'Discount percentage cannot be greater than 100']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        return this.startDate <= value;
      },
      message: 'End date must be greater than or equal to start date'
    }
  },
  eventName: {
    type: String,
    required: true,
    trim: true
  }
}, { _id: false });

const ProductSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    index: true
  },
  nameMR: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  descriptionMR: {
    type: String,
    trim: true,
    default: ''
  },
  mainCategory: {
    type: String,
    required: [true, 'Main category is required'],
    enum: {
      values: [
        'Signature Flagship', 'Industrial & Utility', 'Seasonal & Event',
        'Rangoli', 'Sanskar Bharati Rangoli', 'Portrait Color',
        'Fluorescent Color', 'Tools', 'Holi Color', 'Gulal'
      ],
      message: '{VALUE} is not a supported main category'
    },
    index: true
  },
  subCategory: {
    type: String,
    required: [true, 'Subcategory is required'],
    trim: true,
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Base price is required'],
    min: [0, 'Price must be a positive number']
  },
  wholesalePrice: {
    type: Number,
    required: [true, 'Wholesale price is required'],
    min: [0, 'Wholesale price must be a positive number']
  },
  minWholesaleQuantity: {
    type: Number,
    required: [true, 'Minimum wholesale quantity is required'],
    min: [1, 'Minimum wholesale quantity must be at least 1'],
    default: 20
  },
  stockQuantity: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  imageUrls: {
    type: [String],
    required: [true, 'At least one product image URL is required'],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'Product must have at least one image'
    }
  },
  tags: {
    type: [String],
    default: [],
    index: true
  },
  seasonalDiscount: {
    type: SeasonalDiscountSchema,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound/Text index for search queries
ProductSchema.index({ name: 'text', tags: 'text', description: 'text' }, {
  weights: {
    name: 10,
    tags: 5,
    description: 2
  },
  name: 'ProductTextSearchIndex'
});

// Virtual property to calculate active price after seasonal discounts
ProductSchema.virtual('currentPrice').get(function() {
  if (this.seasonalDiscount) {
    const now = new Date();
    const start = new Date(this.seasonalDiscount.startDate);
    const end = new Date(this.seasonalDiscount.endDate);

    if (now >= start && now <= end) {
      const discountAmount = (this.price * this.seasonalDiscount.discountPercentage) / 100;
      // Round to 2 decimal places
      return Math.round((this.price - discountAmount) * 100) / 100;
    }
  }
  return this.price;
});

// Helper Virtual to check if discount is currently active
ProductSchema.virtual('isDiscountActive').get(function() {
  if (!this.seasonalDiscount) return false;
  const now = new Date();
  const start = new Date(this.seasonalDiscount.startDate);
  const end = new Date(this.seasonalDiscount.endDate);
  return now >= start && now <= end;
});

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
