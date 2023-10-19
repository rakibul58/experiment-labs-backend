const express = require("express");
const courseControllers = require("../../controllers/courses.controller");

const router = express.Router();

router
    .route("/")
    .get(courseControllers.getAllCourses);


module.exports = router;
