require("dotenv").config();

const io = require("socket.io")(8080, {
  cors: { origin: "https://socket-io-ngr4.onrender.com" },
});

const users = [];
const rooms = {};

io.on("connection", (socket) => {
  socket.on("create-user", (name) => {
    const newUser = { userId: socket.id, name };
    users.push(newUser);

    io.emit("user-list", users);
  });

  socket.on("send", (data) => {
    data.room = rooms.name;
    if (rooms.name) {
      io.to(rooms.name).emit("recive-message", data);
    } else io.emit("recive-message", data);
  });

  socket.on("join-room", (room) => {
    socket.join(room);
    rooms.id = socket.id;
    rooms.name = room;
    io.to(room).emit("enter-room", room);
  });

  socket.on("toggle-room", (currentRoom, newRoom) => {
    if (currentRoom) {
      socket.leave(currentRoom);
      delete rooms.id;
      delete rooms.name;
    }

    if (newRoom) {
      socket.join(newRoom);
      rooms.id = socket.id;
      rooms.name = newRoom;
    }
  });

  socket.on("leave-room", (room) => {
    socket.leave(room);
    delete rooms.id;
    delete rooms.name;
  });

  socket.on("disconnect", () => {
    const index = users.findIndex((user) => user.userId === socket.id);
    if (index !== -1) {
      users.splice(index, 1);
    }
    io.emit("user-list", users);
  });
});
