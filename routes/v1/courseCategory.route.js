const express = require("express");

const courseCategoryControllers = require("../../controllers/CourseCategory.controller");


const router = express.Router();


router
  .route("/addCourseCategory/organizationId/:organizationId")
  .post(courseCategoryControllers.addCourseCategory);
router
  .route("/getCourseCategory/organizationId/:organizationId")
  .get(courseCategoryControllers.getCourseCategory);



  module.exports = router;