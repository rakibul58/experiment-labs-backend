const express = require("express");
const redemptionCategoryControllers = require("../../controllers/redemptionCategories.controller");

const router = express.Router();

router
    .route("/")
    .post(redemptionCategoryControllers.addARedemptionCategory);


router
    .route("/organizationId/:organizationId")
    .get(redemptionCategoryControllers.getARedemptionCategoryByOrganizationId);


router
    .route("/categoryName")
    .put(redemptionCategoryControllers.renameACategory);


router
    .route("/categories")
    .put(redemptionCategoryControllers.removeACategory);


router
    .route("/redemptionItems")
    .post(redemptionCategoryControllers.addARedemptionItem)
    .put(redemptionCategoryControllers.updateARedemptionItem)
    .delete(redemptionCategoryControllers.deleteARedemptionItem);


router
    .route("/courseId/:courseId")
    .get(redemptionCategoryControllers.getARedemptionCategoryByCourseId);


module.exports = router;