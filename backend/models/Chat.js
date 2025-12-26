const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    messages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Chat", chatSchema);
