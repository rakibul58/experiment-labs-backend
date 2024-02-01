const express = require("express");
const offerControllers = require("../../controllers/offers.controllers");

const router = express.Router();

router
    .route("/")
    .post(offerControllers.postAnOffer);


router
    .route("/:id")
    .delete(offerControllers.deleteAnOffer);


router
    .route("/organizationId/:organizationId")
    .get(offerControllers.getOfferByOrganizationId);


module.exports = router;
