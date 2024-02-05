// socketSetup.js
const socketIo = require("socket.io");

let io;

function setupSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: "http://localhost:3000", // replace with your frontend URL
    },
  });

  io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("testing", (notification) => {
      console.log("Testing notification: " + notification);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });
}

function getIo() {
  return io;
}

module.exports = { setupSocket, getIo };
