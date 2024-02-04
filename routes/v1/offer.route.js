const express = require("express");
const offerControllers = require("../../controllers/offers.controllers");

const router = express.Router();

router
    .route("/")
    .post(offerControllers.postAnOffer);


router
    .route("/:id")
    .put(offerControllers.updateAnOffer)
    .delete(offerControllers.deleteAnOffer);


router
    .route("/organizationId/:organizationId")
    .get(offerControllers.getOfferByOrganizationId);


router
    .route("/batchId/:batchId")
    .get(offerControllers.getOffersByBatchId);


module.exports = router;
