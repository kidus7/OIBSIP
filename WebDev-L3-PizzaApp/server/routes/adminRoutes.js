const express = require('express');
const { verifyDriver } = require('../controllers/adminController');
const { getDrivers, updateDriver, toggleDriverStatus, deleteDriver } = require('../controllers/userController');
const { claimApproval, assignDriver } = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.patch('/drivers/:id/verify', protect, admin, verifyDriver);
router.get('/drivers', protect, admin, getDrivers);
router.put('/drivers/:id', protect, admin, updateDriver);
router.patch('/drivers/:id/status', protect, admin, toggleDriverStatus);
router.delete('/drivers/:id', protect, admin, deleteDriver);
router.patch('/orders/:id/claim-approval', protect, admin, claimApproval);
router.put('/orders/:id/claim-approval', protect, admin, claimApproval);
router.patch('/orders/:id/assign-driver', protect, admin, assignDriver);
router.put('/orders/:id/assign-driver', protect, admin, assignDriver);

module.exports = router;
