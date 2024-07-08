const express = require("express");
const calenderInfoController = require("../../controllers/calenderInfo.controller");

const router = express.Router();

router.route("/").post(calenderInfoController.syncCalendarToDB);

router.route("/events").put(calenderInfoController.updateEvents);

router
  .route("/email/:email")
  .get(calenderInfoController.getCalendarInfoByEmail);

module.exports = router;
