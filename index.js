const express = require("express");
const cors = require("cors");
require("dotenv").config();
const http = require("http");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
app.use(express.static("front"));
app.use(express.urlencoded({ extended: true }));
const { setupSocket } = require("./socketSetup");

const server = http.createServer(app);
// const io = socketIo(server);
// const io = require("socket.io")(server, {
//   cors: {
//     origin: "http://localhost:3000", // replace with your frontend URL
//   },
// });

const errorHandler = require("./middleware/errorHandler");

// Routes
const testRoutes = require("./routes/v1/test.route");
const mailRoutes = require("./routes/v1/mail.route");
const userRoutes = require("./routes/v1/users.route");
const organizationRoutes = require("./routes/v1/organizations.route");
const courseRoutes = require("./routes/v1/courses.route");
const taskRoutes = require("./routes/v1/tasks.route");
const batchRoutes = require("./routes/v1/batches.route");
const chapterRoutes = require("./routes/v1/chapters.route");
const weekRoutes = require("./routes/v1/weeks.route");
const quizRoutes = require("./routes/v1/quizzes.route");
const skillCategoryRoutes = require("./routes/v1/skillCategories.route");
const earningCategoryRoutes = require("./routes/v1/earningCategories.route");
const eventRoutes = require("./routes/v1/events.route");
const assignmentSubmissionRoutes = require("./routes/v1/assignmentSubmissions.route");
const classRoutes = require("./routes/v1/classes.route");
const redemptionCategoryRoutes = require("./routes/v1/redemptionCategories.route");
const redemptionAccessRoutes = require("./routes/v1/redemptionAccesses.route");
const feedbackCategoriesRoutes = require("./routes/v1/feedbackCategories.route");
const givenFeedbackRoutes = require("./routes/v1/givenFeedbacks.route");
const certificateTemplatesRoutes = require("./routes/v1/certificateTemplates.route");
const { startCronJob } = require("./utils/cronJob");
const statRoutes = require("./routes/v1/stats.route");
const offerRoutes = require("./routes/v1/offer.route");
const notificationsRoutes = require("./routes/v1/notifications.route");

//Calling Functions
startCronJob();

app.get("/", (req, res) => {
  res.send("Hello world");
});

// app.use(cors());
// app.use(express.json());
// app.use(express.static("front"));

// Error handler middleware
app.use(errorHandler);

// Attach your routes after the error handler
app.use("/api/v1/test", testRoutes);
app.use("/api/v1/sendMail", mailRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/organizations", organizationRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/batches", batchRoutes);
app.use("/api/v1/chapters", chapterRoutes);
app.use("/api/v1/weeks", weekRoutes);
app.use("/api/v1/quizzes", quizRoutes);
app.use("/api/v1/skillCategories", skillCategoryRoutes);
app.use("/api/v1/earningCategories", earningCategoryRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/assignmentSubmissions", assignmentSubmissionRoutes);
app.use("/api/v1/classes", classRoutes);
app.use("/api/v1/redemptionCategories", redemptionCategoryRoutes);
app.use("/api/v1/redemptionAccesses", redemptionAccessRoutes);
app.use("/api/v1/feedbackCategories", feedbackCategoriesRoutes);
app.use("/api/v1/givenFeedbacks", givenFeedbackRoutes);
app.use("/api/v1/certificateTemplates", certificateTemplatesRoutes);
app.use("/api/v1/stats", statRoutes);
app.use("/api/v1/offers", offerRoutes);
app.use("/api/v1/notifications", notificationsRoutes);

app.get("/", (req, res) => {
  res.send("Experiment Labs server is running");
});

app.all("*", (req, res) => {
  res.send("No route found.");
});

// app.listen(port, () => {
//   console.log(`Example app listening on port ${port}`);
// });

// const io = require("socket.io")(server, {
//   // pingTimeout: 60000,
//   cors: {
//     origin: `http://localhost:3000`,
//   },
// });

// const io = require("socket.io")(server, {
//   cors: {
//     origin: "http://localhost:3000", // replace with your frontend URL
//   },
// });

// io.on("connection", (socket) => {
//   console.log("A user connected");

//   socket.on("testing", (notification) => {
//     console.log("Testing notification: " + notification);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

setupSocket(server);

// module.exports = { app, server, io };

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
// process.on("unhandledRejection", (error) => {
//   console.log(error.name, error.message);
/*  app.close(() => {
    process.exit(1);
  }); */
// });
