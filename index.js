const app = require("express")();
const server = require("http").createServer(app);
const { v4: uuidv4 } = require("uuid");
const bodyParser = require("body-parser");
const cors = require("cors");
const db = require("mongoose");
require("dotenv").config();

app.use(cors());
app.use(bodyParser.json());
app.use("/auth", require("./routes/index.js"));
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join-this-project-room", (room) => {
    socket.join(room);
  });
  socket.emit("update-online-users", "");
  socket.on("disconnect-from-this-room", (room, email) => {
    socket.leave(room);
    // socket.to(room).emit("left-chat", { message: `${email} left the chat` });
  });
  socket.on("typing-start", (room, who) => {
    socket.broadcast.to(room).emit("typing-started", who);
  });
  socket.on("typing-stop", (room) => {
    socket.broadcast.to(room).emit("typing-stopped", "");
  });
});

db.connect(
  `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@db.zrgix.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  }
)
  .then(() => {
    console.log("connected...");
  })
  .catch((err) => {
    console.log(err);
  });
server.listen(5000, () => {
  console.log("running...");
});
app.set("socket", io);
