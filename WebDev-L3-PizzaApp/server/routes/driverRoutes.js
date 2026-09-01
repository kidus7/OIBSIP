const express = require('express');
const { updateStatus } = require('../controllers/driverController');
const { protect, driverOnly } = require('../middleware/authMiddleware');

const router = express.Router();

router.patch('/status', protect, driverOnly, updateStatus);

module.exports = router;
