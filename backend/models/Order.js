const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const OrderItemSchema = new Schema({
  productId: {
    type: String,
    default: ''
  },
  product: {
    type: Schema.Types.Mixed,
    ref: 'Product',
    required: false
  },
  name: {
    type: String,
    default: 'Rangoli Product'
  },
  nameMR: {
    type: String,
    default: ''
  },
  selectedWeight: {
    type: String,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  priceAtPurchase: {
    type: Number,
    required: true,
    min: [0, 'Price at purchase must be a positive number']
  }
}, { _id: false });

const OrderSchema = new Schema({
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  customerEmail: {
    type: String,
    required: [true, 'Customer email is required'],
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  customerPhone: {
    type: String,
    required: [true, 'Customer phone number is required'],
    trim: true
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required'],
    trim: true
  },
  items: {
    type: [OrderItemSchema],
    required: [true, 'Order must contain at least one item'],
    validate: {
      validator: function(arr) {
        return arr && arr.length > 0;
      },
      message: 'Order must contain at least one product item'
    }
  },
  totalPrice: {
    type: Number,
    required: true,
    min: [0, 'Total price cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Failed'],
    default: 'Pending',
    index: true
  },
  fulfillmentStatus: {
    type: String,
    enum: ['Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Ready-for-Pickup', 'Cancelled'],
    default: 'Processing',
    index: true
  },
  transactionId: {
    type: String,
    trim: true,
    default: null,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay', 'Online'],
    default: 'COD'
  },
  deliveryOtp: {
    code: {
      type: String,
      default: null
    },
    generatedAt: {
      type: Date,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verifiedAt: {
      type: Date,
      default: null
    },
    attempts: {
      type: Number,
      default: 0
    }
  },
  whatsappLogs: [{
    type: {
      type: String,
      default: 'NOTIFICATION'
    },
    message: {
      type: String
    },
    phone: {
      type: String
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    isSimulated: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
