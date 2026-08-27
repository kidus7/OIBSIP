const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add ingredient name'],
      unique: true,
      trim: true
    },
    category: {
      type: String,
      required: [true, 'Please specify category'],
      enum: ['base', 'sauce', 'cheese', 'veggie', 'pre-made']
    },
    description: {
      type: String,
      trim: true
    },
    imageURL: {
      type: String,
      trim: true
    },
    stock: {
      type: Number,
      required: [true, 'Please add stock quantity'],
      min: 0,
      default: 0
    },
    unit: {
      type: String,
      default: 'units'
    },
    price: {
      type: Number,
      required: [true, 'Please add price'],
      default: 0
    },
    minThreshold: {
      type: Number,
      default: 20
    },
    inStock: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Inventory', InventorySchema);
