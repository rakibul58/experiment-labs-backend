const express = require("express");
const userControllers = require("../../controllers/users.controller");

const router = express.Router();

router
    .route("/")
    .get(userControllers.getAnUserByEmail)
    .post(userControllers.saveAUser);

router
    .route("/organizationId/:organizationId")
    .get(userControllers.getAllMentors);


module.exports = router;
