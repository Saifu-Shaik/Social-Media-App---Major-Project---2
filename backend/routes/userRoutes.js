const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../config/multer");
const User = require("../models/User"); // Used for search feature

const {
  getProfile,
  getUserById,
  updateProfile,
  getAllUsers,
  followUser,
  unfollowUser,
} = require("../controllers/userController");

/* ================= PROFILE ROUTES ================= */

// Get logged-in user profile
router.get("/profile", auth, getProfile);

// Update profile (username, bio, profile picture)
router.put("/profile", auth, upload.single("profilePic"), updateProfile);

/* ================= FOLLOW ROUTES ================= */

router.post("/follow/:id", auth, followUser);

router.post("/unfollow/:id", auth, unfollowUser);

/* ================= GET ALL USERS ================= */

router.get("/", auth, getAllUsers);

/* ================= SEARCH USERS ================= */

router.get("/search/:name", auth, async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.name, $options: "i" },
    }).select("username profilePic");

    res.status(200).json(users);
  } catch (error) {
    console.error("SEARCH USER ERROR:", error);
    res.status(500).json({ message: "Error searching users" });
  }
});

/* ================= GET USER BY ID ================= */

router.get("/:id", auth, getUserById);

module.exports = router;
