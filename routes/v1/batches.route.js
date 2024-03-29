const express = require("express");
const batchControllers = require("../../controllers/batches.controller");

const router = express.Router();

router.route("/").post(batchControllers.createABatch);

router.route("/courseId/:courseId").get(batchControllers.getBatchesByCourseId);

router.route("/batchId/:batchId").get(batchControllers.getBatchesByBatchId);

router
  .route("/updateBatch/batchId/:batchId")
  .put(batchControllers.updateABatchData);

router
  .route("/deleteBatch/batchId/:batchId")
  .delete(batchControllers.deleteBatch);

module.exports = router;
