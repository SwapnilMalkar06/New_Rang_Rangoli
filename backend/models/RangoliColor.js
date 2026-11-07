const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const WeightVariantSchema = new Schema({
  label: { type: String, required: true },
  retailPrice: { type: Number, required: true, min: 0 },
  wholesalePrice: { type: Number, required: true, min: 0 },
  inStock: { type: Boolean, default: true }
}, { _id: false });

const RangoliColorSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true
  },
  colorType: {
    type: String,
    enum: ['rangoli', 'sanskar_bharati'],
    default: 'rangoli',
    index: true
  },
  number: {
    type: String,
    required: true,
    trim: true
  },
  nameEn: {
    type: String,
    required: true,
    trim: true
  },
  nameMr: {
    type: String,
    trim: true,
    default: ''
  },
  shadeName: {
    type: String,
    trim: true,
    default: ''
  },
  category: {
    type: String,
    trim: true,
    default: 'Standard'
  },
  hex: {
    type: String,
    trim: true,
    default: '#FF0000'
  },
  image: {
    type: String,
    trim: true,
    default: ''
  },
  descriptionEn: {
    type: String,
    trim: true,
    default: ''
  },
  descriptionMr: {
    type: String,
    trim: true,
    default: ''
  },
  textureDetails: {
    type: String,
    trim: true,
    default: ''
  },
  weights: {
    type: Schema.Types.Mixed,
    required: true,
    default: {}
  },
  orderIndex: {
    type: Number,
    default: 0
  },
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const RangoliColor = mongoose.model('RangoliColor', RangoliColorSchema);

module.exports = RangoliColor;
