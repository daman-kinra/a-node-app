const db = require("mongoose");

const chats = db.Schema(
  {
    roomId: {
      type: String,
    },
    sender: {
      type: String,
    },
    message: {
      type: String,
    },
    mentioned: {
      type: [String],
    },
  },
  { timestamps: true }
);

module.exports = db.model("chats", chats);
