const User = require('../models/User');
const Token = require('../models/Token');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    user = await User.create({
      name,
      email,
      password,
      role: 'user',
      isVerified: true
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Register admin
// @route   POST /api/v1/auth/admin-register
// @access  Public
exports.adminRegister = async (req, res, next) => {
  try {
    const { name, email, password, adminSecret } = req.body;

    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ success: false, error: 'Invalid admin security key' });
    }

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    user = await User.create({
      name,
      email,
      password,
      role: 'admin',
      isVerified: true
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Verify email
// @route   GET /api/v1/auth/verify/:id/:token
// @access  Public
exports.verifyEmail = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(400).json({ success: false, error: 'Invalid link' });

    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token
    });
    if (!token) return res.status(400).json({ success: false, error: 'Invalid or expired token' });

    user.isVerified = true;
    await user.save();
    await token.deleteOne();

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ success: false, error: 'Please verify your email first' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin login
// @route   POST /api/v1/auth/admin-login
// @access  Public
exports.adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    console.log (`Admin login attempt with email: ${email}`);
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ success: false, error: 'No user with that email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    await Token.create({
      userId: user._id,
      token: resetToken
    });

    const message = `You are receiving this because you (or someone else) have requested the reset of a password. Please click on the following link: http://${req.headers.host}/api/v1/auth/reset-password/${user._id}/${resetToken}`;

    await sendEmail({
      email: user.email,
      subject: 'Password Reset Token',
      message
    });

    res.status(200).json({ success: true, data: 'Email sent' });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   PUT /api/v1/auth/reset-password/:id/:token
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { id, token } = req.params;
    const { password } = req.body;

    const user = await User.findById(id).select('+password');
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid link or user not found' });
    }

    const resetTokenRecord = await Token.findOne({
      userId: user._id,
      token: token
    });

    if (!resetTokenRecord) {
      return res.status(400).json({ success: false, error: 'Invalid or expired password reset token' });
    }

    user.password = password;
    await user.save();
    await resetTokenRecord.deleteOne();

    res.status(200).json({ success: true, message: 'Password updated successfully. You can now login.' });
  } catch (error) {
    next(error);
  }
};

// Helper function to get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};
