const express = require("express");
const organizationControllers = require("../../controllers/organizations.controller");

const router = express.Router();

router
    .route("/")
    .post(organizationControllers.createAnOrganization);


module.exports = router;
