const User = require('../models/User');
const { login } = require('./authController');

// @desc    Create a driver account (Admin Protected)
// @route   POST /api/v1/users/create-driver
// @access  Private/Admin
exports.createDriver = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User with this email already exists' });
    }

    user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      role: 'driver',
      isVerified: true
    });

    res.status(201).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all drivers (Admin Protected)
// @route   GET /api/v1/users/drivers
// @access  Private/Admin
exports.getDrivers = async (req, res, next) => {
  try {
    const drivers = await User.find({ role: 'driver' }).select('-password');
    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a driver account (Admin Protected)
// @route   PUT /api/v1/users/drivers/:id
// @access  Private/Admin
exports.updateDriver = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    let driver = await User.findById(req.params.id);

    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    driver.name = name || driver.name;
    driver.email = email || driver.email;
    driver.phone = phone !== undefined ? phone : driver.phone;
    if (password && password.trim() !== '') {
      driver.password = password;
    }

    await driver.save();

    res.status(200).json({
      success: true,
      data: {
        _id: driver._id,
        name: driver.name,
        email: driver.email,
        phone: driver.phone,
        role: driver.role,
        isActive: driver.isActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle driver active status (Admin Protected)
// @route   PATCH /api/v1/users/drivers/:id/status
// @access  Private/Admin
exports.toggleDriverStatus = async (req, res, next) => {
  try {
    const driver = await User.findById(req.params.id);

    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    driver.isActive = !driver.isActive;
    await driver.save();

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a driver account (Admin Protected)
// @route   DELETE /api/v1/users/drivers/:id
// @access  Private/Admin
exports.deleteDriver = async (req, res, next) => {
  try {
    const driver = await User.findById(req.params.id);

    if (!driver || driver.role !== 'driver') {
      return res.status(404).json({ success: false, error: 'Driver not found' });
    }

    await driver.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    User/Driver login
// @route   POST /api/v1/users/login
// @access  Public
exports.loginUser = login;
