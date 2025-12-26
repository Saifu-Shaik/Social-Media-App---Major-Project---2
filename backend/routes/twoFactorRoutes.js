const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const twoFactorController = require("../controllers/twoFactorController");

router.get("/enable", auth, twoFactorController.enable2FA);

router.post("/verify", auth, twoFactorController.verify2FA);

module.exports = router;
