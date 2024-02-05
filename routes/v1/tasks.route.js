const express = require("express");
const taskControllers = require("../../controllers/tasks.controller");

const router = express.Router();

router
    .route("/taskType/:taskType/courseId/:courseId")
    .get(taskControllers.getAllTasksByTaskTypeAndCourseId);



router
    .route("/taskType/:taskType/taskId/:taskId")
    .get(taskControllers.getTasksByTaskTypeAndTaskId)
    .delete(taskControllers.deleteATask)
    .put(taskControllers.updateATask);


router
    .route("/taskType/:taskType/chapterId/:chapterId")
    .get(taskControllers.getTasksByTaskTypeAndChapterId);


router
    .route("/chapterId/:chapterId")
    .get(taskControllers.getTasksByChapterId);


router
    .route("/taskType/:taskType")
    .get(taskControllers.getTasksByTaskType)
    .post(taskControllers.addATask);


router
    .route("/taskType/:taskType/taskId/:taskId/chapterId/:chapterId")
    .post(taskControllers.addTaskCompletionDetails);


router
    .route("/updateEvent/:email")
    .post(taskControllers.updateEvent);


router
    .route("/:id/addEvent")
    .post(taskControllers.addEvent);


router
    .route("/assignments/taskId/:taskId")
    .delete(taskControllers.removeFile);


module.exports = router;