const { validationResult } = require('express-validator');
const googleAuthService = require('../services/googleAuthService');
const User = require('../models/User');

const {
  signup,
  login,
  googleAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,

  createSendToken,
  createRandomToken,
} = require('../services/authService');
const { sendWelcomeEmail } = require('../services/emailService');
const otpGenerator = require('otp-generator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');


exports.getMe = (req, res) => {
  res.status(200).json({
    status: "success",
    data: { user: req.user }
  });
};

// Sign up new user
exports.signup = async (req, res, next) => {
  try {
   const { email  } = req.body;

    // 🔍 1. FETCH USER FROM DB
    const existingUser = await User.findOne({ email });


    // ❌ 2. IF USER EXISTS
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "User already exists"
      });
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // ✅ 1. Create user
    const result = await signup(req.body); // your service
    const user = result.user || result;

    // ✅ 2. Generate token
    const { rawToken, hashedToken } = createRandomToken();

    // ✅ 3. Save hashed token in DB
    user.emailVerificationToken = hashedToken;
    user.verificationTokenExpires = Date.now() + 10 * 60 * 1000;

    // await user.save({ validateBeforeSave: false });

    // ✅ 4. Send email with RAW token
    const verifyURL = `http://localhost:3000/verify-email/${rawToken}`;
    console.log("VERIFY URL:", verifyURL);
    const message = `<h2>Verify Your Email</h2><p>Click <a href="${verifyURL}">here</a> to verify your email</p>`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Verify your email',
        message: message
      });
    } catch (emailError) {
      console.warn('Email sending failed (non-fatal):', emailError.message);
    }

    // ✅ 5. Send response (NO redirect here)
    res.status(201).json({
      status: 'success',
      message: 'Verification email sent'
    });

  } catch (error) {
    next(error);
  }
};

// exports.registerUser = async (req, res) => {
//   res.json({ message: "Register working" });
// };

// Login user


exports.login = async (req, res, next) => {
  try {
    // ✅ Validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // ✅ Call service
    const user = await login(email, password);

    // ✅ Send token
    createSendToken(user, 200, res, 'Login successful');

    console.log("LOGIN RESPONSE:", user.email);

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    // ✅ Handle known errors
    if (error.message?.includes('Incorrect email or password')) {
      return res.status(401).json({
        status: 'fail',
        message: error.message,
      });
    }

    if (error.message?.includes('verify')) {
      return res.status(403).json({
        status: 'fail',
        message: error.message,
      });
    }

    if (error.message?.includes('deactivated')) {
      return res.status(403).json({
        status: 'fail',
        message: error.message,
      });
    }

    // ✅ Default fallback (VERY IMPORTANT)
    return res.status(error.statusCode || 500).json({
      status: 'error',
      message: error.message || 'Internal Server Error',
    });
  }
};
// Google OAuth
exports.googleAuth = async (req, res, next) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'fail',
        message: 'Google token is required'
      });
    }

    const user = await googleAuthService(token);

    createSendToken(user, 200, res, 'Google authentication successful');
  } catch (error) {
    console.error('Google Auth Error:', error.message);
    
    if (error.message && error.message.includes('token')) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid or expired Google token'
      });
    }

    next(error);
  }
};



// ✅ SEND OTP
exports.sendOTP = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    console.log("OTP REQUEST EMAIL:", email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    let user = await User.findOne({
  email: { $regex: `^${email}$`, $options: "i" }
});
    

    if (!user) {
      return res.status(400).json({
        message: "User not found. Please signup first"
      });
    }

    // ✅ Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
      lowerCaseAlphabets: false
    });

    // ✅ Hash OTP
    const hashedOtp = await bcrypt.hash(otp, 10);

    // ✅ Save in DB
    user.otp = hashedOtp;
    user.otpExpiry = Date.now() + 5 * 60 * 1000;

    await user.save();

    // ✅ FIX EMAIL FORMAT
    try {
      await sendEmail({
        email: email,
        subject: "Your OTP Code",
        message: `<p>Your OTP is <strong>${otp}</strong>. It expires in 5 minutes.</p>`
      });

      console.log("OTP:", otp); // 🔥 debug
    } catch (emailError) {
      console.warn('OTP Email sending failed:', emailError.message);
    }

    console.log("OTP:", otp); // 🔥 debug

    res.status(200).json({
      status: 'success',
      message: "OTP sent successfully"
    });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ error: error.message });
  }
};

// ✅ VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP required"
      });
    }

    const user = await User.findOne({ email });
    console.log("OTP REQUEST EMAIL:", email);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ Check OTP exists
    if (!user.otp || !user.otpExpiry) {
      return res.status(400).json({
        message: "No OTP found. Request new one."
      });
    }

    // ✅ Check expiry
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({
        message: "OTP expired"
      });
    }

    // ✅ Compare OTP
    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    // ✅ Verify user
    user.isEmailVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: "Email verified successfully"
    });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    res.status(500).json({
      status: 'fail',
      message: error.message
    });
  }
};

// Verify email
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query; // ✅ FIX

    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid or expired token'
      });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });

  } catch (error) {
    next(error);
  }
};


// Forgot password
exports.forgotPassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const result = await forgotPassword(email);

    res.status(200).json({
      status: 'success',
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token } = req.params;
    const { password } = req.body;
    const user = await resetPassword(token, password);

    createSendToken(user, 200, res, 'Password reset successful');
  } catch (error) {
    next(error);
  }
};

// Update password (for logged in users)
exports.updatePassword = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = await updatePassword(req.user, currentPassword, newPassword);

    createSendToken(user, 200, res, 'Password updated successfully');
  } catch (error) {
    next(error);
  }
};



// Logout user
exports.logout = (req, res, next) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: 'lax',
    });

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (error) {
    console.error('Logout Error:', error); // 👈 IMPORTANT
    next(error);
  }
};
// Update user profile
exports.updateMe = async (req, res, next) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'fail',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Filter out unwanted fields
    const filteredBody = {};
    const allowedFields = [
  'firstName',
  'lastName',
  'phone',
  'email',        // ✅ ADD
  'addresses',    // ✅ ADD
  'preferences'
];
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete user account
exports.deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Resend verification email
exports.resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;
    
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is already verified'
      });
    }

    const { sendEmailVerification } = require('../services/authService');
    await sendEmailVerification(user);

    res.status(200).json({
      status: 'success',
      message: 'Verification email sent'
    });
  } catch (error) {
    next(error);
  }
};

// Check if email exists
exports.checkEmail = async (req, res, next) => {
  try {
    const { email } = req.params;
    
    const user = await User.findByEmail(email);
    
    res.status(200).json({
      status: 'success',
      data: {
        exists: !!user,
        isVerified: user ? user.isEmailVerified : false
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh token
exports.refreshToken = async (req, res, next) => {
  try {
    // User is already attached to req by auth middleware
    const user = req.user;
    
    createSendToken(user, 200, res, 'Token refreshed successfully');
  } catch (error) {
    next(error);
  }
};

// Remove the old module.exports = { ... } block and just use:
// module.exports = exports;
// Alternative approach - use exports object directly
// module.exports = exports;
