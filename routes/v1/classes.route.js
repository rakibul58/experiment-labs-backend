const express = require("express");
const classControllers = require("../../controllers/classes.controller");

const router = express.Router();


router
    .route("/")
    .post(classControllers.createAMeeting);


router
    .route("/:id")
    .post(classControllers.addAnAttendee);


router
    .route('/recordings/meetingId/:meetingId')
    .post(classControllers.getARecording);


module.exports = router;