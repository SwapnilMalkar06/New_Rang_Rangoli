const mongoose = require('mongoose');
const crypto = require('crypto');

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  role: {
    type: String,
    enum: ['customer', 'retailer', 'admin'],
    default: 'customer'
  },
  businessName: {
    type: String,
    trim: true,
    required: function() { return this.role === 'retailer'; }
  },
  gstin: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

// Hash password pre-save
UserSchema.pre('save', function(next) {
  if (this.isModified('password')) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(this.password, salt, 1000, 64, 'sha512').toString('hex');
    this.password = `${salt}:${hash}`;
  }
  if (typeof next === 'function') {
    next();
  }
});

// Compare password method
UserSchema.methods.comparePassword = function(candidatePassword) {
  const parts = this.password.split(':');
  if (parts.length !== 2) return false;
  const [salt, originalHash] = parts;
  const hash = crypto.pbkdf2Sync(candidatePassword, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
};

const User = mongoose.model('User', UserSchema);

module.exports = User;
