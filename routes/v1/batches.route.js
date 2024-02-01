const express = require("express");
const batchControllers = require("../../controllers/batches.controller");

const router = express.Router();

router.route("/").post(batchControllers.createABatch);

router.route("/courseId/:courseId").get(batchControllers.getBatchesByCourseId);

router.route("/batchId/:batchId").get(batchControllers.getBatchesByBatchId);

router
  .route("/updateBatch/batchId/:batchId")
  .put(batchControllers.updateACourseData);

module.exports = router;
