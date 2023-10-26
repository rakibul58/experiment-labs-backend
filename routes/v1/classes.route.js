const express = require("express");
const classControllers = require("../../controllers/classes.controller");

const router = express.Router();

router
    .route("/:id")
    .post(classControllers.addAnAttendee);


module.exports = router;