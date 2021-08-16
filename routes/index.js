const express = require("express");
const route = express.Router();
const users = require("../models/users.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { requireLogin } = require("../middlewares/auth.js");
const projects = require("../models/projects");
const { v4 } = require("uuid");
const tasks = require("../models/tasks.js");
const chats = require("../models/chats.js");

route.post("/register", async (req, res) => {
  const { name, email, password, username, profileurl } = req.body;
  try {
    let user = await users.findOne({ email });
    if (user) {
      return res.status(400).send("User Already Exist");
    }
    const hashed_pass = await bcrypt.hash(password, 10);
    user = new users({
      name,
      email,
      username,
      profileurl,
      password: hashed_pass,
    });
    await user.save();
    return res.status(201).send("User Created");
  } catch (err) {
    console.log(err);
  }
});

route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(400).send("User does not exist");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Wrong PassWord");
    }
    const token = jwt.sign({ _id: user._id }, "secret", {
      expiresIn: "1h",
    });
    return res.json({ token });
  } catch (err) {
    console.log(err);
  }
});

route.get("/", requireLogin, async (req, res) => {
  try {
    if (req.error) {
      res.status(200).json({ error: true });
    } else {
      const socket = await req.app.get("socket");
      const user = await users.findById(req.user._id).select("-password");
      const project = await projects.find({ parteners: { $in: [user.email] } });
      await socket.emit("welcome", "hello");
      res.json({ user, project });
    }
  } catch (error) {
    console.log(error);
  }
});

route.post("/newproject", requireLogin, async (req, res) => {
  try {
    if (req.error) {
      res.status(200).json({ error: true });
    } else {
      const user = await users.findById(req.user._id).select("-password");
      const project = new projects({
        project_id: v4(),
        owner: user.email,
        parteners: [user.email],
        tasks: [],
        name: req.body.name,
        description: req.body.description,
      });
      await project.save();
      res.status(200).json(project);
    }
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: error });
  }
});

route.post("/newtask", requireLogin, async (req, res) => {
  try {
    if (req.error) {
      res.status(200).json({ error: true });
    } else {
      const newtask = new tasks({
        task_id: v4(),
        project_id: req.body.project_id,
        created_by: req.body.created_by,
        name: req.body.name,
        description: req.body.description,
      });
      await newtask.save();
      await projects.updateOne(
        { project_id: req.body.project_id },
        { $push: { tasks: newtask._id } }
      );
      res.status(200).json(newtask);
    }
  } catch (error) {
    res.json(error);
  }
});

route.post("/newMessage", async (req, res) => {
  const socket = await req.app.get("socket");
  const chat = new chats({
    message: req.body.message,
    sender: req.body.sender,
    mentioned: req.body.mentioned,
    roomId: req.body.roomId,
  });
  await chat.save();
  await socket.to(req.body.roomId).emit("new-message", chat);
  res.status(200).json(chat);
});

route.post("/projectMessages", async (req, res) => {
  const chat = await chats.find({ roomId: req.body.roomId });
  res.status(200).json(chat);
});

route.post("/deleteMessage", async (req, res) => {
  const socket = await req.app.get("socket");
  await chats.findByIdAndRemove(req.body._id);
  await socket.to(req.body.roomId).emit("delete-message", req.body._id);
  res.status(200).json({ message: "done" });
});
module.exports = route;
