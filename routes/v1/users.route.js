const express = require("express");
const userControllers = require("../../controllers/users.controller");

const router = express.Router();

router
    .route("/")
    .get(userControllers.getAnUserByEmail)
    .post(userControllers.saveAUser);

router
    .route("/mentors/organizationId/:organizationId")
    .get(userControllers.getAllMentors);


router
    .route("/unpaidUsers/checkout")
    .post(userControllers.checkoutPayment);

router
    .route("/unpaidUsers/verifyPayment")
    .post(userControllers.verifyPayment);


module.exports = router;
