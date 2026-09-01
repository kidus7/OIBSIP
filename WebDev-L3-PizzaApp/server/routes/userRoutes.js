const express = require('express');
const {
  createDriver,
  getDrivers,
  updateDriver,
  toggleDriverStatus,
  deleteDriver,
  loginUser,
  updateProfile
} = require('../controllers/userController');

const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const router = express.Router();

router.put('/profile', protect, updateProfile);
router.post('/login', loginUser);
router.post('/create-driver', protect, admin, createDriver);
router.get('/drivers', protect, admin, getDrivers);
router.put('/drivers/:id', protect, admin, updateDriver);
router.patch('/drivers/:id/status', protect, admin, toggleDriverStatus);
router.delete('/drivers/:id', protect, admin, deleteDriver);

module.exports = router;
