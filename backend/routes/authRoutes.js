const router = require("express").Router();
const {
  register,
  verifySignupOTP,
  login,
  verifyLoginOTP
} = require("../controllers/authController");

router.post("/register", register);
router.post("/verify-signup", verifySignupOTP);
router.post("/login", login);
router.post("/verify-login", verifyLoginOTP);

module.exports = router;
