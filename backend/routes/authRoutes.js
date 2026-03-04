const router = require("express").Router();

const {
  register,
  verifySignupOTP,
  login,
  verifyLoginOTP,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-signup", verifySignupOTP);
router.post("/login", login);
router.post("/verify-login", verifyLoginOTP);

// ✅ Forgot Password Feature (Added)
router.post("/forgot-password", forgotPassword);

// ✅ Reset Password using token (Added)
router.post("/reset-password/:token", resetPassword);

module.exports = router;
