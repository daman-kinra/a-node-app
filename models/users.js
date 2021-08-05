const db = require("mongoose");

const users = db.Schema(
  {
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    email: {
      type: String,
    },
    name: {
      type: String,
    },
    profileUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = db.model("users", users);
