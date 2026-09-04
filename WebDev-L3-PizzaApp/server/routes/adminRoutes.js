const express = require('express');
const { verifyDriver } = require('../controllers/adminController');
const { getDrivers, updateDriver, toggleDriverStatus, deleteDriver } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.get('/drivers', protect, admin, getDrivers);
router.put('/drivers/:id', protect, admin, updateDriver);
router.delete('/drivers/:id', protect, admin, deleteDriver);
router.patch('/drivers/:id/verify', protect, admin, verifyDriver);
router.patch('/drivers/:id/status', protect, admin, toggleDriverStatus);

module.exports = router;
