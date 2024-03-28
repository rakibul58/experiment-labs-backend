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
  .get(eventControllers.fetchEventRequest);

router.route("/:id").get(eventControllers.getAnEvent);

router.route("/email/:email").get(eventControllers.getEventsByEmail);

module.exports = router;
