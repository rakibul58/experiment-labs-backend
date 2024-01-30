const express = require("express");
const statsControllers = require("../../controllers/stats.controller");

const router = express.Router();

router
  .route("/organizationId/:organizationId")
  .get(statsControllers.getUsersByOrganizationId);


  module.exports = router;