const express = require("express");
const calenderInfoController = require("../../controllers/calenderInfo.controller");

const router = express.Router();

router
  .route("/updateOrInsertCalendarInfo/email/:email")
  .post(calenderInfoController.updateOrInsertCalendarInfo);
router
  .route("/getCalendarInfoByEmail/email/:email")
  .get(calenderInfoController.getCalendarInfoByEmail);



  module.exports = router;