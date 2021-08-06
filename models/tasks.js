const db = require("mongoose");

const tasks = db.Schema(
  {
    task_id: {
      type: String,
    },
    project_id: {
      type: String,
    },
    created_by: {
      type: String,
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

module.exports = db.model("tasks", tasks);
