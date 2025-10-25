const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { User, OTP } = require('../models');
const mailSender = require('../config/mailSender');
const { parseNITWEmail } = require('../util/emailParser');
const { assignUserToAllGroups } = require('./groupController');

const JWT_SECRET = process.env.JWT_SECRET || 'campus_connect_secret_2024';

/**
 * Register - Step 1: Send OTP after user fills initial details
 * @route POST /api/auth/register
 * @body { email, name, password, confirmPassword }
 */
exports.register = async (req, res) => {
  try {
    const { email, name, password, confirmPassword } = req.body;

    if (!email || !name || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!email.endsWith('@student.nitw.ac.in')) {
      return res.status(400).json({ error: 'Only valid NITW student email addresses are allowed.' });
    }

    // Parse email to extract academic details
    let academicDetails;
    try {
      academicDetails = parseNITWEmail(email);
    } catch (parseError) {
      return res.status(400).json({ error: parseError.message });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match.' });
    }

    // Check if user exists
    const existing = await User.findOne({ collegeEmail: email });
    if (existing) {
      return res.status(409).json({ error: 'Account already exists.' });
    }

    // Generate 6-digit OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Store OTP (expire in 5 minutes via TTL index)
    await OTP.create({ email, otp });

    // Send OTP via email
    await mailSender(
      email,
      'Account Verification for Campus Connect',
      `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Welcome to Campus Connect, ${name}!</h2>
        <p>To complete your registration, please enter the OTP below:</p>
        <h1 style="color: #4CAF50; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
        <p><strong>Your Details:</strong></p>
        <ul>
          <li>Branch: ${academicDetails.branch}</li>
          <li>Class: ${academicDetails.className}</li>
          <li>Year: ${academicDetails.year}</li>
          <li>Section: ${academicDetails.section}</li>
          <li>Roll Number: ${academicDetails.rollNumber}</li>
        </ul>
        <p>If you didn't request this, please ignore this email.</p>
      </div>`
    );

    return res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email. Please verify to complete registration.',
      email,
      academicDetails, // Send parsed details to frontend for display
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Failed to process registration. Please try again.' });
  }
};

/**
 * Verify OTP - Step 2: Verify OTP and create account
 * @route POST /api/auth/verifyotp
 * @body { email, otp, name, password }
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;

    if (!email || !otp || !name || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    // Parse email to extract academic details
    let academicDetails;
    try {
      academicDetails = parseNITWEmail(email);
    } catch (parseError) {
      return res.status(400).json({ error: parseError.message });
    }

    // Find the most recent OTP for this email
    const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });
    if (!otpRecord) {
      return res.status(400).json({ error: 'OTP expired or not found. Please register again.' });
    }
    if (otpRecord.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    // OTP is valid - delete all OTPs for this email
    await OTP.deleteMany({ email });

    // Check again if user exists (race condition safety)
    const existing = await User.findOne({ collegeEmail: email });
    if (existing) {
      return res.status(409).json({ error: 'Account already exists.' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user with parsed academic details
    const user = await User.create({
      collegeEmail: email,
      name,
      passwordHash,
      branch: academicDetails.branch,
      year: academicDetails.year,
      className: academicDetails.className,
      section: academicDetails.section,
      rollNumber: academicDetails.rollNumber,
      isVerified: true,
    });

    // Auto-assign user to all relevant groups (branch, class, year, section)
    try {
      await assignUserToAllGroups(user);
    } catch (groupErr) {
      console.error('Failed to assign user to groups:', groupErr);
      // Continue even if group assignment fails
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.collegeEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.collegeEmail,
        branch: user.branch,
        className: user.className,
        year: user.year,
        section: user.section,
        rollNumber: user.rollNumber,
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err);
    return res.status(500).json({ error: 'Failed to verify OTP and create account.' });
  }
};

/**
 * Login controller
 * @route POST /api/auth/login
 * @body { email, password }
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await User.findOne({ collegeEmail: email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.collegeEmail },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.collegeEmail,
        branch: user.branch,
        className: user.className,
        year: user.year,
        section: user.section,
        rollNumber: user.rollNumber,
        avatarUrl: user.avatarUrl,
      },
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to login.' });
  }
};
