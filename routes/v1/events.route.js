const express = require("express");
const eventControllers = require("../../controllers/events.controller");

const router = express.Router();

router
  .route("/")
  .get(eventControllers.getAllEvent)
  .post(eventControllers.addAnEvent);

router
  .route("/request")
  .post(eventControllers.eventRequest);

router
  .route("/request/organizationId/:organizationId")
  .post(eventControllers.fetchEventRequest);

router
  .route("/recording/organizationId/:organizationId")
  .post(eventControllers.fetchRecording);

router.route("/:id").get(eventControllers.getAnEvent);

router.route("/email/:email").get(eventControllers.getEventsByEmail);


router
  .route("/meeting/organizationId/:organizationId")
  .post(eventControllers.createZoomMeeting);

module.exports = router;
