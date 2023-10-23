const express = require("express");
const weekControllers = require("../../controllers/weeks.controller");

const router = express.Router();

router
    .route("/")
    .post(weekControllers.addAWeek);


router
    .route("/:id")
    .get(weekControllers.getAWeekById)
    .put(weekControllers.renameAWeek)
    .delete(weekControllers.deleteAWeek);


router
    .route("/courseId/:courseId")
    .get(weekControllers.getWeeksByCourseId);


module.exports = router;