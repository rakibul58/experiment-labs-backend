const express = require("express");
const eventControllers = require("../../controllers/events.controller");

const router = express.Router();

router
  .route("/")
  .get(eventControllers.getAllEvent)
  .post(eventControllers.addAnEvent);

router.route("/request").post(eventControllers.eventRequest);

router
  .route("/request/organizationId/:organizationId")
  .post(eventControllers.fetchEventRequest);

router
  .route("/recording/organizationId/:organizationId")
  .post(eventControllers.fetchRecording);

router
  .route("/:id")
  .get(eventControllers.getAnEvent)
  .put(eventControllers.updateAnEvent);

router.route("/email/:email").get(eventControllers.getEventsByEmail);

router
  .route("/meeting/organizationId/:organizationId")
  .post(eventControllers.createZoomMeeting);
  
router
  .route("/deleteMeeting/organizationId/:organizationId/meetingId/:meetingId")
  .delete(eventControllers.deleteZoomMeeting);

router
  .route("/account/organizationId/:organizationId")
  .patch(eventControllers.updateAccountSettings);

router
  .route("/schedules/mentorId/:mentorId")
  .get(eventControllers.getSchedulesOfMentorsStudents);
  
router
  .route("/eventId/:eventId/assign-executionMentor")
  .put(eventControllers?.assignMentorToEvent);

router
  .route("/mentorEmail/:email")
  .get(eventControllers?.getEventsByExecutionMentorEmail);

module.exports = router;
