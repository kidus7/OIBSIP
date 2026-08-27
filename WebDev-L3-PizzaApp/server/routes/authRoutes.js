const express = require('express');
const {
  register,
  adminRegister,
  verifyEmail,
  login,
  adminLogin,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/admin-register', adminRegister);
router.get('/verify/:id/:token', verifyEmail);
router.post('/login', login);
router.post('/admin-login', adminLogin);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:id/:token', resetPassword);
router.post('/reset-password/:id/:token', resetPassword);

module.exports = router;
