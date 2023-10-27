const express = require("express");
const redemptionAccessControllers = require("../../controllers/redemptionAccess.controller");

const router = express.Router();

router
    .route("/")
    .post(redemptionAccessControllers.addAnAccessItem);


router
    .route("/organizationId/:organizationId/userId/:userId")
    .get(redemptionAccessControllers.getARedemptionAccessByOrganizationIdAndUserId);


module.exports = router;