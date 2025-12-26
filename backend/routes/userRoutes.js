const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const upload = require("../config/multer");

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

router.get("/:id", auth, getUserById);

module.exports = router;
