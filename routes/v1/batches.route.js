const express = require("express");
const batchControllers = require("../../controllers/batches.controller");

const router = express.Router();


router
    .route("/")
    .post(batchControllers.createABatch);


router
    .route("/courseId/:courseId")
    .get(batchControllers.getBatchesByCourseId);


module.exports = router;