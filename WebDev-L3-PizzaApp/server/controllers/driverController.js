const User = require('../models/User');

// @desc    Update driver availability status
// @route   PATCH /api/v1/driver/status
// @access  Private/Driver
exports.updateStatus = async (req, res, next) => {
  try {
    const { isOnline, status } = req.body;
    const user = await User.findById(req.user.id);

    if (!user || user.role !== 'driver') {
      return res.status(403).json({ success: false, error: 'Not authorized as a driver' });
    }

    if (isOnline !== undefined) {
      user.isOnline = Boolean(isOnline);
      user.status = isOnline ? 'active' : 'offline';
      user.isActive = Boolean(isOnline);
    } else if (status !== undefined) {
      user.status = status;
      user.isOnline = status === 'active';
      user.isActive = status === 'active';
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isOnline: user.isOnline,
        status: user.status,
        isActive: user.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};
