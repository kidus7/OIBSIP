const express = require('express');
const {
  createOrder,
  createRazorpayOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  getDriverAvailableOrders,
  claimOrder,
  completeOrder,
  updateOrderETA
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, admin, getAllOrders)
  .post(protect, createOrder);

router.post('/create-razorpay-order', protect, createRazorpayOrder);
router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/admin/all', protect, admin, getAllOrders);
router.get('/driver/available', protect, getDriverAvailableOrders);
router.put('/:id/claim', protect, claimOrder);
router.put('/:id/complete', protect, completeOrder);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/eta', protect, admin, updateOrderETA);

module.exports = router;
