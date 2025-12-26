const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user)
      .select("-password -twoFactorSecret")
      .populate("followers", "username profilePic")
      .populate("following", "username profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("GET PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const targetUser = await User.findById(req.params.id)
      .select("-password -twoFactorSecret")
      .populate("followers", "username profilePic")
      .populate("following", "username profilePic");

    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = targetUser.followers.some(
      (f) => f._id.toString() === req.user.toString()
    );

    res.status(200).json({
      user: targetUser,
      isFollowing,
    });
  } catch (error) {
    console.error("GET USER BY ID ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.body.username && req.body.username !== user.username) {
      const exists = await User.findOne({
        username: req.body.username,
        _id: { $ne: req.user },
      });

      if (exists) {
        return res.status(400).json({ message: "Username already taken" });
      }

      user.username = req.body.username;
    }

    if (req.body.bio !== undefined) {
      user.bio = req.body.bio;
    }

    if (req.file) {
      user.profilePic = req.file.filename;
    }

    await user.save();

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -twoFactorSecret");

    res.status(200).json(users);
  } catch (error) {
    console.error("GET USERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.followUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    if (targetId.toString() === req.user.toString()) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }

    const [targetUser, currentUser] = await Promise.all([
      User.findById(targetId),
      User.findById(req.user),
    ]);

    if (!targetUser || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (targetUser.followers.includes(req.user)) {
      return res.status(400).json({ message: "Already following" });
    }

    targetUser.followers.push(req.user);
    currentUser.following.push(targetId);

    await Promise.all([targetUser.save(), currentUser.save()]);

    res.status(200).json({ message: "Followed successfully" });
  } catch (error) {
    console.error("FOLLOW ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.unfollowUser = async (req, res) => {
  try {
    const targetId = req.params.id;

    await Promise.all([
      User.findByIdAndUpdate(targetId, {
        $pull: { followers: req.user },
      }),
      User.findByIdAndUpdate(req.user, {
        $pull: { following: targetId },
      }),
    ]);

    res.status(200).json({ message: "Unfollowed successfully" });
  } catch (error) {
    console.error("UNFOLLOW ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
