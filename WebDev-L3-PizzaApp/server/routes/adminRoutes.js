const express = require('express');
const { verifyDriver } = require('../controllers/adminController');
const { getDrivers, updateDriver, toggleDriverStatus, deleteDriver } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.patch('/drivers/:id/verify', protect, admin, verifyDriver);
router.get('/drivers', protect, admin, getDrivers);
router.put('/drivers/:id', protect, admin, updateDriver);
router.patch('/drivers/:id/status', protect, admin, toggleDriverStatus);
router.delete('/drivers/:id', protect, admin, deleteDriver);

module.exports = router;
