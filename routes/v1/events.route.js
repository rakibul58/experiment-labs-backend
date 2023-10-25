const express = require("express");
const eventControllers = require("../../controllers/events.controller");

const router = express.Router();

router
    .route("/")
    .get(eventControllers.getAllEvent)
    .post(eventControllers.addAnEvent);


router
    .route("/:id")
    .get(eventControllers.getAnEvent);


module.exports = router;