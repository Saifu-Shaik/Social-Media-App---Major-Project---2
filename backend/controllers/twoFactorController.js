const speakeasy = require("speakeasy");
const qrcode = require("qrcode");
const User = require("../models/User");

exports.enable2FA = async (req, res) => {
  try {
    const secret = speakeasy.generateSecret({
      length: 20,
      name: `SocialMediaApp (${req.user})`,
    });

    const qrCode = await qrcode.toDataURL(secret.otpauth_url);

    await User.findByIdAndUpdate(req.user, {
      twoFactorSecret: secret.base32,
      twoFactorEnabled: false,
    });

    res.status(200).json({
      qrCode,
      secret: secret.base32,
    });
  } catch (error) {
    console.error("ENABLE 2FA ERROR:", error);
    res.status(500).json({ message: "Failed to enable 2FA" });
  }
};

exports.verify2FA = async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findById(req.user);

    if (!user || !user.twoFactorSecret) {
      return res.status(400).json({ message: "2FA not initialized" });
    }

    const verified = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
      window: 1,
    });

    if (!verified) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.twoFactorEnabled = true;
    await user.save();

    res.status(200).json({ message: "2FA verified successfully" });
  } catch (error) {
    console.error("VERIFY 2FA ERROR:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};
