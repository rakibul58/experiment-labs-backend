const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const { MongoClient, ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const app = express();
const notificationCollection = client
  .db("experiment-labs")
  .collection("notifications");

const server = http.createServer(app);
const io = socketIo(server);

module.exports.getAllNotifications = async (req, res) => {
  const notifications = await notificationCollection.find().toArray();
  res.json(notifications);
};

module.exports.addNotification = async (req, res) => {
  const notification = req.body;

  const result = await notificationCollection.insertOne(notification);

  // Send the new notification to all connected clients
  io.emit("notification", notification);

  res.json(result);
};

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});
