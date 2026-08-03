import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import { sendOtpEmail } from '../config/nodemailer.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user (Email & Password)
// @route   POST /api/users/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, phone, password, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are mandatory for account registration' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check existing email
    const cleanEmail = email.toLowerCase().trim();
    const emailExists = await User.findOne({ email: cleanEmail });
    if (emailExists) {
      return res.status(400).json({ message: 'An account with this email address already exists' });
    }

    // Check existing phone if provided
    if (phone) {
      const phoneExists = await User.findOne({ phone: phone.trim() });
      if (phoneExists) {
        return res.status(400).json({ message: 'An account with this phone number already exists' });
      }
    }

    const user = await User.create({
      name,
      email: cleanEmail,
      phone: phone ? phone.trim() : undefined,
      password,
      address: address || {},
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isBlocked: user.isBlocked,
      address: user.address,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token (Email/Phone + Password)
// @route   POST /api/users/login
export const loginUser = async (req, res, next) => {
  try {
    const { emailOrPhone, email, password } = req.body;
    const identifier = (emailOrPhone || email || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Please enter email/phone and password' });
    }

    // Create variations of phone number to match how it might have been saved
    const cleanPhone = identifier.replace(/\D/g, '').slice(-10);

    // Search user by email or phone
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { phone: identifier },
        ...(cleanPhone.length === 10 ? [
          { phone: cleanPhone },
          { phone: `+91${cleanPhone}` },
          { phone: `+91 ${cleanPhone}` },
          { phone: `91${cleanPhone}` }
        ] : [])
      ],
    });

    if (user && user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by store administrator. Please contact support.' });
    }

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isBlocked: user.isBlocked,
        address: user.address,
        role: user.role,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid credentials. Please check password.' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Send Email OTP via Nodemailer (Gmail SMTP)
// @route   POST /api/users/send-otp
export const sendOtp = async (req, res, next) => {
  try {
    const { email, phone } = req.body;
    const targetEmail = (email || '').trim().toLowerCase();

    if (!targetEmail || !targetEmail.includes('@')) {
      return res.status(400).json({ message: 'Please enter a valid email address to receive OTP' });
    }

    let user = await User.findOne({ email: targetEmail });
    if (user && user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by store administrator.' });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (!user) {
      user = new User({
        name: targetEmail.split('@')[0],
        email: targetEmail,
        phone: phone || '',
        otp: generatedOtp,
        otpExpires,
      });
    } else {
      user.otp = generatedOtp;
      user.otpExpires = otpExpires;
      if (phone) user.phone = phone;
    }
    await user.save();

    // Send real email via Gmail SMTP
    await sendOtpEmail(targetEmail, generatedOtp, user.name);

    res.json({
      success: true,
      message: `6-Digit OTP verification code sent to ${targetEmail}. Please check your inbox.`,
    });
  } catch (error) {
    console.error('Send OTP Error:', error);
    res.status(500).json({ message: error.message || 'Failed to send OTP email' });
  }
};

// @desc    Verify Email OTP & Log In
// @route   POST /api/users/verify-otp
export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp, name } = req.body;
    const targetEmail = (email || '').trim().toLowerCase();
    const enteredOtp = (otp || '').trim();

    if (!targetEmail || !enteredOtp) {
      return res.status(400).json({ message: 'Email address and 6-digit OTP code are required' });
    }

    const user = await User.findOne({ email: targetEmail });

    if (user && user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by store administrator.' });
    }

    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: 'No OTP requested for this email address' });
    }

    if (new Date() > new Date(user.otpExpires)) {
      return res.status(400).json({ message: 'OTP has expired. Please request a new OTP' });
    }

    if (user.otp !== enteredOtp) {
      return res.status(400).json({ message: 'Incorrect OTP code. Please check your email inbox and try again.' });
    }

    // OTP Verified! Clear temporary OTP
    user.isPhoneVerified = true; // Mark account verified
    user.otp = null;
    user.otpExpires = null;
    if (name && (!user.name || user.name.includes('@'))) {
      user.name = name.trim();
    }
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
      isBlocked: user.isBlocked,
      address: user.address,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isPhoneVerified: user.isPhoneVerified,
        isBlocked: user.isBlocked,
        address: user.address,
        role: user.role,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) {
        user.password = req.body.password;
      }
      if (req.body.address) {
        user.address = { ...user.address, ...req.body.address };
      }

      const updatedUser = await user.save();
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        isPhoneVerified: updatedUser.isPhoneVerified,
        isBlocked: updatedUser.isBlocked,
        address: updatedUser.address,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/users/change-password
export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Please provide both old and new passwords' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'New password must be at least 6 characters long' });
    }

    const user = await User.findById(req.user._id);

    if (user && (await user.matchPassword(oldPassword))) {
      user.password = newPassword;
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } else {
      res.status(401).json({ message: 'Incorrect old password' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users (admin)
// @route   GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle block status of a user (admin)
// @route   PUT /api/users/:id/block
export const toggleBlockUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block an admin account' });
    }
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({
      message: user.isBlocked ? 'User blocked successfully' : 'User unblocked successfully',
      isBlocked: user.isBlocked,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user (admin)
// @route   DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete an admin account' });
    }
    await user.deleteOne();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate with Google OAuth
// @route   POST /api/users/google-login
import { OAuth2Client } from 'google-auth-library';
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ message: 'Google token is missing' });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, sub: googleId } = payload;
    
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user && user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked by store administrator.' });
    }

    if (!user) {
      // Create user if not exists
      user = await User.create({
        name,
        email: email.toLowerCase(),
        isPhoneVerified: true, // we assume google email is verified
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isPhoneVerified: user.isPhoneVerified,
      isBlocked: user.isBlocked,
      address: user.address,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(401).json({ message: 'Invalid Google token' });
  }
};
