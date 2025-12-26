const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const upload = require("../config/multer");

const {
  createPost,
  getPosts,
  getPostsByUser,
  toggleLike,
  addComment,
  deletePost,
} = require("../controllers/postController");

router.post("/", auth, upload.single("image"), createPost);

router.get("/", getPosts);

router.get("/user/:userId", getPostsByUser);

router.post("/like/:id", auth, toggleLike);

router.post("/comment/:id", auth, addComment);

router.delete("/:id", auth, deletePost);

module.exports = router;
