const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  getChatUsers,
  getMessages,
  sendMessage,
  deleteChat, // 🔥 NEW
} = require("../controllers/messageContoller");

/**
 * @route
 * @desc
 * @access
 */
router.get("/", auth, getChatUsers);

/**
 * @route
 * @desc
 * @access
 */
router.get("/:userId", auth, getMessages);

/**
 * @route
 * @desc
 * @access
 */
router.post("/", auth, sendMessage);

/**
 * @route
 * @desc
 * @access
 */
router.delete("/:userId", auth, deleteChat);

module.exports = router;
