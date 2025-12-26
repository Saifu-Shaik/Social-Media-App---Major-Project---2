const Chat = require("../models/Chat");

exports.createChat = async (req, res) => {
  const chat = await Chat.create({ users: req.body.users });
  res.status(201).json(chat);
};
