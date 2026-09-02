const express = require('express');
const { updateStatus, verifyDeliveryOTP } = require('../controllers/driverController');
const { protect, driverOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.patch('/status', protect, driverOnly, updateStatus);
router.put('/orders/:id/verify', protect, driverOnly, verifyDeliveryOTP);
router.patch('/orders/:id/verify', protect, driverOnly, verifyDeliveryOTP);

module.exports = router;
