const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");

const crypto = require("crypto");

// =============================
// REGISTER
// =============================
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const secret = speakeasy.generateSecret({ length: 20 });

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false,
      isVerified: false,
    });

    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    res.status(201).json({
      message: "Scan QR and verify OTP",
      userId: user._id,
      qrCode,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// VERIFY SIGNUP OTP
// =============================
exports.verifySignupOTP = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ message: "OTP required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.twoFactorEnabled = true;

    await user.save();

    res.json({ message: "Signup successful. Please login." });
  } catch (error) {
    console.error("SIGNUP OTP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// LOGIN
// =============================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Account not verified. Complete OTP verification.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    res.json({
      message: "OTP required",
      userId: user._id,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// VERIFY LOGIN OTP
// =============================
exports.verifyLoginOTP = async (req, res) => {
  try {
    const { userId, token } = req.body;

    if (!userId || !token) {
      return res.status(400).json({ message: "OTP required" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const jwtToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token: jwtToken,
    });
  } catch (error) {
    console.error("LOGIN OTP ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// FORGOT PASSWORD (UPDATED - FAST)
// =============================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const token = crypto.randomBytes(32).toString("hex");

    user.resetToken = token;
    user.resetTokenExpire = Date.now() + 3600000;

    await user.save();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    console.log("RESET PASSWORD LINK:", resetLink);

    // 🚀 Directly return reset link (no email sending)
    res.json({
      message: "Reset link generated",
      resetLink,
    });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// RESET PASSWORD
// =============================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
