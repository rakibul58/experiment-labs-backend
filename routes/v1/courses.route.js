const express = require("express");
const courseControllers = require("../../controllers/courses.controller");

const router = express.Router();

router
    .route("/")
    .get(courseControllers.getAllCourses)
    .post(courseControllers.addACourse);

router
    .route("/:id")
    .get(courseControllers.getACourseById);

router
    .route("/organizationId/:organizationId")
    .get(courseControllers.getCoursesByOrganizationId);


module.exports = router;
