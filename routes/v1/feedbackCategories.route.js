const express = require("express");
const feedbackCategoryControllers = require("../../controllers/feedbackCategories.controller");

const router = express.Router();

router
    .route("/")
    .get();


module.exports = router;