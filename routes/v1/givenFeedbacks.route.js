const express = require("express");
const givenFeedbackControllers = require("../../controllers/givenFeedbacks.controller");

const router = express.Router();

router
    .route("/")
    .post(givenFeedbackControllers.postAFeedback);


router
    .route("/taskId/:taskId")
    .get(givenFeedbackControllers.getAFeedbackByTaskId);


router
    .route("/courseId/:courseId")
    .get(givenFeedbackControllers.getFeedbackByCourseId);


module.exports = router;