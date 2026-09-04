const express = require('express');
const {
  createOrder,
  verifyPayment,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
  getDriverAvailableOrders,
  claimOrder,
  claimApproval,
  assignDriver,
  completeOrder,
  updateOrderETA
} = require('../controllers/orderController');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, admin, getAllOrders)
  .post(protect, createOrder);

router.post('/verify-payment', protect, verifyPayment);
router.get('/my-orders', protect, getMyOrders);
router.get('/driver/available', protect, getDriverAvailableOrders);

router.patch('/:id/status', protect, admin, updateOrderStatus);
router.patch('/:id/eta', protect, admin, updateOrderETA);
router.patch('/:id/claim', protect, claimOrder);
router.patch('/:id/claim-approval', protect, admin, claimApproval);
router.patch('/:id/assign-driver', protect, admin, assignDriver);
router.patch('/:id/complete', protect, completeOrder);

router.get('/:id', protect, getOrderById);

module.exports = router;
