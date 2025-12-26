const Message = require("../models/Message");

exports.getChatUsers = async (req, res) => {
  try {
    const myId = req.user.toString();

    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    })
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic")
      .sort({ createdAt: -1 });

    const usersMap = new Map();

    messages.forEach((m) => {
      const otherUser =
        m.sender._id.toString() === myId ? m.receiver : m.sender;

      usersMap.set(otherUser._id.toString(), otherUser);
    });

    res.status(200).json([...usersMap.values()]);
  } catch (error) {
    console.error("Get chat users error:", error);
    res.status(500).json({ message: "Failed to load chat users" });
  }
};

exports.getMessages = async (req, res) => {
  try {
    const { userId } = req.params;
    const myId = req.user.toString();

    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "username profilePic")
      .populate("receiver", "username profilePic");

    res.status(200).json(messages);
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, text } = req.body;
    const myId = req.user.toString();

    if (!receiverId || !text) {
      return res.status(400).json({
        message: "Receiver ID and message text are required",
      });
    }

    let message = await Message.create({
      sender: myId,
      receiver: receiverId,
      text,
    });

    message = await message.populate("sender", "username profilePic");

    const io = req.app.get("io");

    if (io) {
      io.to(receiverId.toString()).emit("receiveMessage", message);

      io.to(myId).emit("receiveMessage", message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

exports.deleteChat = async (req, res) => {
  try {
    const myId = req.user.toString();
    const { userId } = req.params;

    await Message.deleteMany({
      $or: [
        { sender: myId, receiver: userId },
        { sender: userId, receiver: myId },
      ],
    });

    res.status(200).json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete chat error:", error);
    res.status(500).json({ message: "Failed to delete chat" });
  }
};
