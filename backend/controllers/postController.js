const Post = require("../models/Post");
const fs = require("fs");
const path = require("path");

exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;

    if ((!text || !text.trim()) && !req.file) {
      return res.status(400).json({
        message: "Post must contain text or image",
      });
    }

    const post = await Post.create({
      user: req.user,
      text: text ? text.trim() : "",
      image: req.file ? req.file.filename : null,
    });

    const populatedPost = await Post.findById(post._id)
      .populate("user", "username profilePic")
      .populate("comments.user", "username");

    res.status(201).json(populatedPost);
  } catch (err) {
    console.error("CREATE POST ERROR:", err);
    res.status(500).json({ message: "Post creation failed" });
  }
};

exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "username profilePic")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("GET POSTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};

exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.userId })
      .populate("user", "username profilePic")
      .populate("comments.user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (err) {
    console.error("GET USER POSTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch user posts" });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const alreadyLiked = post.likes.includes(req.user);

    if (alreadyLiked) {
      post.likes.pull(req.user);
    } else {
      post.likes.push(req.user);
    }

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username profilePic")
      .populate("comments.user", "username");

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("LIKE ERROR:", err);
    res.status(500).json({ message: "Like failed" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: req.user,
      text: text.trim(),
    });

    await post.save();

    const updatedPost = await Post.findById(post._id)
      .populate("user", "username profilePic")
      .populate("comments.user", "username");

    res.status(200).json(updatedPost);
  } catch (err) {
    console.error("COMMENT ERROR:", err);
    res.status(500).json({ message: "Comment failed" });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== req.user.toString()) {
      return res.status(403).json({
        message: "You are not allowed to delete this post",
      });
    }

    if (post.image) {
      const imagePath = path.join(__dirname, "..", "uploads", post.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await post.deleteOne();

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error("DELETE POST ERROR:", err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
