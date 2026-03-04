const express = require("express");
const router = express.Router();

const {
  register,
  verifySignupOTP,
  login,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

/* ============================= */
/* AUTH ROUTES                   */
/* ============================= */

// Register user
router.post("/register", register);

// Verify signup OTP
router.post("/verify-signup", verifySignupOTP);

// Login user
router.post("/login", login);

// Verify login OTP
router.post("/verify-login", verifyLoginOTP);

/* ============================= */
/* PASSWORD RESET ROUTES         */
/* ============================= */

// Forgot password → generate reset link
router.post("/forgot-password", forgotPassword);

// Reset password using token
router.post("/reset-password/:token", resetPassword);

module.exports = router;
