const express = require("express");
const chapterControllers = require("../../controllers/chapters.controller");

const router = express.Router();

router
    .route("/")
    .get(chapterControllers.getAllChapters)
    .post(chapterControllers.addAChapter);


router
    .route("/:id")
    .get(chapterControllers.getAChapterById)
    .put(chapterControllers.renameAChapter);


router
    .route("/weekId/:weekId")
    .get(chapterControllers.getChaptersByWeekId);


router
    .route("/courseId/:courseId")
    .get(chapterControllers.getChaptersByCourseId);


module.exports = router;