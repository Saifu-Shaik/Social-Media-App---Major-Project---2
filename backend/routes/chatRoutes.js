const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { createChat } = require("../controllers/chatController");

router.post("/", auth, createChat);

module.exports = router;
