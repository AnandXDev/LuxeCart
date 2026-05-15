const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");
const { sendEmail } = require("./emailService");

// Generate JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || "7d",
  });
};

// Create and send token response
const createSendToken = (user, statusCode, res, message) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "123456", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  res.cookie("jwt", token, {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "lax", // 👈 important
    secure: true, // 👈 true in production
  });

  res.status(statusCode).json({
    status: "success",
    message,
    token,
    data: {
      user,
    },
  });
};

// Generate random token
const createRandomToken = () => {
  const rawToken = crypto.randomBytes(32).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  return { rawToken, hashedToken };
};

// Send email verification
const sendEmailVerification = async (user) => {
  const verificationToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  user.emailVerificationToken = hashedToken;
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

  const message = `
    <h2>Email Verification</h2>
    <p>Thank you for registering! Please verify your email address by clicking the link below:</p>
    <a href="${verificationUrl}" style="background-color: #4CAF50; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">Verify Email</a>
    <p>This link will expire in 24 hours.</p>
    <p>If you didn't create an account, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification - Dropship Ecommerce",
      message,
    });
  } catch (error) {
    user.emailVerificationToken = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error(
      "There was an error sending the verification email. Please try again later.",
    );
  }
};

// Send password reset email
const sendPasswordResetEmail = async (user) => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  user.passwordResetToken = hashedToken;
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const message = `
    <h2>Password Reset Request</h2>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="background-color: #f44336; color: white; padding: 14px 25px; text-align: center; text-decoration: none; display: inline-block; border-radius: 4px;">Reset Password</a>
    <p>This link will expire in 10 minutes.</p>
    <p>If you didn't request a password reset, please ignore this email.</p>
  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset - Dropship Ecommerce",
      message,
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    throw new Error(
      "There was an error sending the password reset email. Please try again later.",
    );
  }
};

// Sign up new user
const signup = async (userData) => {
  const { firstName, lastName, email, password, phone } = userData;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new Error("A user with this email already exists");
  }

  // Create new user
  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    phone,
  });

  // Send email verification
  await sendEmailVerification(newUser);

  // Don't send token until email is verified
  // newUser.password = undefined;

  return {
    message:
      "User registered successfully. Please check your email to verify your account.",
    user: newUser,
  };
};

// Login user
const login = async (email, password) => {
  // Check if email and password exist
  if (!email || !password) {
    throw new Error("Please provide email and password");
  }

  // Check if user exists && password is correct
  const user = await User.findByEmail(email).select("+password");

  if (!user) {
  throw new Error("User not found");
}

// 🚨 NEW CHECK
if (!user.password) {
  const error = new Error("Please login using Google or reset your password");
error.statusCode = 400;
throw error;
}

const isMatch = await user.correctPassword(password, user.password);

if (!isMatch) {
  throw new Error("Incorrect email or password");
}

  // Check if user is active
  if (!user.isActive) {
    throw new Error(
      "Your account has been deactivated. Please contact support.",
    );
  }

  // Check if email is verified
  if (!user.isEmailVerified) {
    const error = new Error("Please verify your email first");
error.statusCode = 403;
throw error;  
  }

  // Update last login
  user.lastLogin = new Date();
  user.loginCount += 1;
  await user.save({ validateBeforeSave: false });

  // Remove password from output
  user.password = undefined;

  return user;
};

// Google OAuth login/signup
const googleAuth = async (googleUser) => {
  const { id, email, firstName, lastName, picture } = googleUser;

  // Check if user exists with Google ID
  let user = await User.findByGoogleId(id);

  if (user) {
    // User exists, log them in
    if (!user.isActive) {
      throw new Error(
        "Your account has been deactivated. Please contact support.",
      );
    }

    // Update last login
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save({ validateBeforeSave: false });
  } else {
    // Check if user exists with email
    const existingUser = await User.findByEmail(email);

    if (existingUser) {
      // Link Google account to existing user
      existingUser.googleId = id;
      existingUser.isEmailVerified = true; // Google email is verified
      existingUser.lastLogin = new Date();
      existingUser.loginCount += 1;
      user = await existingUser.save();
    } else {
      // Create new user with Google data
      user = await User.create({
        firstName: firstName || "",
        lastName: lastName || "",
        email,
        googleId: id,
        avatar: picture,
        isEmailVerified: true, // Google email is verified
        lastLogin: new Date(),
        loginCount: 1,
      });
    }
  }

  // Remove password from output
  user.password = undefined;

  return user;
};

// Verify email
const verifyEmail = async (token) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    isEmailVerified: false,
  });

  if (!user) {
    throw new Error("Token is invalid or has expired");
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  return user;
};

// Forgot password
const forgotPassword = async (email) => {
  // Find user by email
  const user = await User.findByEmail(email);

  if (!user) {
    throw new Error("There is no user with that email address");
  }

  // Generate reset token
  await sendPasswordResetEmail(user);

  return {
    message: "Password reset token sent to email",
  };
};

// Reset password
const resetPassword = async (token, newPassword) => {
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  // Find user by token and check if token hasn't expired
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    throw new Error("Token is invalid or has expired");
  }

  // Set new password
  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.passwordChangedAt = Date.now();

  await user.save();

  return user;
};

// Update password
const updatePassword = async (user, currentPassword, newPassword) => {
  // Get user with password
  const userWithPassword = await User.findById(user.id).select("+password");

  // Check if current password is correct
  if (
    !(await userWithPassword.correctPassword(
      currentPassword,
      userWithPassword.password,
    ))
  ) {
    throw new Error("Your current password is wrong");
  }

  // Update password
  userWithPassword.password = newPassword;
  userWithPassword.passwordChangedAt = Date.now();
  await userWithPassword.save();

  return userWithPassword;
};

// Logout user
const logout = (req, res) => {
  res.cookie("jwt", "", {
    expires: new Date(0), // 👈 instantly expire
    httpOnly: true,
    sameSite: "lax", // 👈 must match login cookie
    secure: false, // 👈 true in production (https)
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

module.exports = {
  signToken,
  createSendToken,
  createRandomToken,
  sendEmailVerification,
  sendPasswordResetEmail,
  signup,
  login,
  googleAuth,
  verifyEmail,
  forgotPassword,
  resetPassword,
  updatePassword,
  logout,
};
