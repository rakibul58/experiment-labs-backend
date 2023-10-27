const express = require("express");
const feedbackCategoryControllers = require("../../controllers/feedbackCategories.controller");

const router = express.Router();

router
    .route("/")
    .post(feedbackCategoryControllers.addAFeedbackCategory);


router
    .route("/categoryName")
    .put(feedbackCategoryControllers.updateACategoryNameAndRating);


router
    .route("/categories")
    .put(feedbackCategoryControllers.removeACategory);


router
    .route("/organizationId/:organizationId")
    .get(feedbackCategoryControllers.getAFeedbackCategoryByOrganizationId);


router
    .route("/feedbackItems")
    .post(feedbackCategoryControllers.addAFeedbackItem)
    .put(feedbackCategoryControllers.updateAFeedbackItem)
    .delete(feedbackCategoryControllers.deleteAFeedbackItem);


module.exports = router;