const express = require("express");
const testControllers = require("../../controllers/test.controller");

const router = express.Router();

router
    .route("/")
    .get(testControllers.getAllTest)
    .post(testControllers.saveATest);

router
    .route("/:id")
    .delete(testControllers.deleteATest);


module.exports = router;
