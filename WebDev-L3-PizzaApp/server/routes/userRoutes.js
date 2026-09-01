const express = require('express');
const {
  createDriver,
  getDrivers,
  updateDriver,
  toggleDriverStatus,
  verifyDriver,
  deleteDriver,
  loginUser,
  updateProfile
} = require('../controllers/userController');

const { protect, driverOnly } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { updateStatus } = require('../controllers/driverController');

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.patch('/driver/status', protect, driverOnly, updateStatus);
router.post('/login', loginUser);
router.post('/create-driver', protect, admin, createDriver);
router.get('/drivers', protect, admin, getDrivers);
router.put('/drivers/:id', protect, admin, updateDriver);
router.patch('/drivers/:id/status', protect, admin, toggleDriverStatus);
router.patch('/drivers/:id/verify', protect, admin, verifyDriver);
router.delete('/drivers/:id', protect, admin, deleteDriver);

module.exports = router;
