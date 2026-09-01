const User = require('../models/User');

// @desc    Verify driver account (Admin Protected)
// @route   PATCH /api/v1/admin/drivers/:id/verify
// @access  Private/Admin
exports.verifyDriver = async (req, res, next) => {
  try {
    const driver = await User.findById(req.params.id);

    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    driver.isVerified = true;
    driver.isActive = true;
    await driver.save();

    res.status(200).json({
      success: true,
      message: 'Driver verified successfully',
      data: driver
    });
  } catch (error) {
    next(error);
  }
};
