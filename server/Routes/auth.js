const express = require('express');
const router = express.Router();
const { register, verifyOTP, login } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Step 1: User fills form and clicks "Next" - sends OTP
router.post('/register', register);

// @route   POST /api/auth/verifyotp
// @desc    Step 2: Verify OTP and create account
router.post('/verifyotp', verifyOTP);

// @route   POST /api/auth/login
// @desc    Login with email and password
router.post('/login', login);

module.exports = router;
