const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const User = require("../models/User"); // ✅ Added for search feature

const {
  getProfile,
  getUserById,
  updateProfile,
  getAllUsers,
  followUser,
  unfollowUser,
} = require("../controllers/userController");

router.get("/profile", auth, getProfile);

router.put("/profile", auth, upload.single("profilePic"), updateProfile);

router.post("/follow/:id", auth, followUser);
router.post("/unfollow/:id", auth, unfollowUser);

router.get("/", auth, getAllUsers);

// ✅ NEW FEATURE: Search Users
router.get("/search/:name", auth, async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.name, $options: "i" },
    }).select("username profilePic");

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error searching users" });
  }
});

router.get("/:id", auth, getUserById);

module.exports = router;
