const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    pizzas: [
      {
        name: { type: String },
        base: { type: String },
        sauce: { type: String },
        cheese: { type: String },
        veggies: [{ type: String }],
        quantity: { type: Number, default: 1 },
        price: { type: Number, required: true }
      }
    ],
    totalPrice: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'],
      default: 'Order Received'
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    pendingDriverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    claimStatus: {
      type: String,
      enum: ['none', 'pending', 'approved', 'declined'],
      default: 'none'
    },
    paymentInfo: {
      id: { type: String },
      status: { type: String, default: 'Pending' },
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String }
    },
    deliveryCode: {
      type: String
    },
    deliveryAddress: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true }
    },
    estimatedDeliveryTime: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', OrderSchema);
