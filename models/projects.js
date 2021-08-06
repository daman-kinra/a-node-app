const db = require("mongoose");

const projects = db.Schema(
  {
    project_id: {
      type: String,
    },
    owner: {
      type: String,
    },
    parteners: {
      type: [String],
    },
    tasks: {
      type: [String],
    },
    name: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = db.model("projects", projects);
