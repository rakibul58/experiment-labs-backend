const express = require("express");
const skillCategoriesControllers = require("../../controllers/skillCategories.controller");

const router = express.Router();

router
  .route("/")
  .get(skillCategoriesControllers.getAllSkillCategory)
  .post(skillCategoriesControllers.addASkillCategory);

router.route("/:id").delete(skillCategoriesControllers.deleteASkillCategory);

router
  .route("/organizationId/:organizationId")
  .get(skillCategoriesControllers.getASkillCategoryByOrganizationId);

router
  .route("/skills")
  .post(skillCategoriesControllers.addASkill)
  .delete(skillCategoriesControllers.deleteASkill)
  .put(skillCategoriesControllers.updateASkill);

router
  .route("/categoryName")
  .put(skillCategoriesControllers.updateACategoryName);

router.route("/categories").put(skillCategoriesControllers.removeACategory);

router
  .route("/organizationId/:organizationId/courseId/:courseId")
  .get(skillCategoriesControllers.getCategoriesByOrganizationIdAndCourseId);

module.exports = router;
