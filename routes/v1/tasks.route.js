const express = require("express");
const taskControllers = require("../../controllers/tasks.controller");

const router = express.Router();

router
    .route("/taskType/:taskType/courseId/:courseId")
    .get(taskControllers.getAllTasksByTaskTypeAndCourseId);


module.exports = router;