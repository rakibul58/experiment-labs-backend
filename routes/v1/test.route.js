const express = require("express");
const testControllers = require("../../controllers/test.controller");

const router = express.Router();

router
    .route("/")
    .get(testControllers.getAllTest)
    .post(testControllers.saveATest)
    .put(testControllers.updateAllTests);

router
    .route("/:id")
    .delete(testControllers.deleteATest)
    .put(testControllers.updateTest);


module.exports = router;
