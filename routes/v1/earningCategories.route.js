const express = require("express");
const earningCategoriesControllers = require("../../controllers/earningCategories.controller");

const router = express.Router();

router
    .route("/")
    .get(earningCategoriesControllers.getAllEarningCategory)
    .post(earningCategoriesControllers.addAnEarningCategory);


router
    .route("/organizationId/:organizationId")
    .get(earningCategoriesControllers.getAnEarningCategoryByOrganizationId);


router
    .route("/earningItems")
    .post(earningCategoriesControllers.addAnEarningItem)
    .put(earningCategoriesControllers.updateAnEarningItem)
    .delete(earningCategoriesControllers.deleteAnEarningItem);


router
    .route("/categoryName")
    .put(earningCategoriesControllers.updateACategoryName);


router
    .route("/categories")
    .put(earningCategoriesControllers.removeACategory);


router
    .route("/organizationId/:organizationId/courseId/:courseId")
    .get(earningCategoriesControllers.getAnEarningCategoryByOrganizationIdAndCourseId);


module.exports = router;