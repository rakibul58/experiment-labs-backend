const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;


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
const skillCategoriesRoutes = require("./routes/v1/skillCategories.route");
const earningCategoriesRoutes = require("./routes/v1/earningCategories.route");
const eventRoutes = require("./routes/v1/events.route");
const assignmentSubmissionRoutes = require("./routes/v1/assignmentSubmissions.route");


app.get('/', (req, res) => {
    res.send('Hello world')
})

app.use(cors());
app.use(express.json());
app.use(express.static('front'));

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
app.use("/api/v1/skillCategories", skillCategoriesRoutes);
app.use("/api/v1/earningCategories", earningCategoriesRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/assignmentSubmissions", assignmentSubmissionRoutes);



app.get("/", (req, res) => {
  res.send("Experiment Labs server is running");
});

app.all("*", (req, res) => {
  res.send("No route found.");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

process.on("unhandledRejection", (error) => {
  console.log(error.name, error.message);
  app.close(() => {
    process.exit(1);
  });
});