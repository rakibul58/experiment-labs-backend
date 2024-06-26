const express = require("express");
const questionControllers = require("../../controllers/questionBank.controller");

const router = express.Router();

router.route("/addQuestion").post(questionControllers.addQuestion);

router
  .route("/organizationId/:organizationId")
  .get(questionControllers.getQuestionsByOrganizationId);

router
  .route("/quizId/:quizId/batchId/:batchId")
  .get(questionControllers.getQuestionsForQuizAndBatch);

router.route("/questionId/:questionId").put(questionControllers.updateQuestion);

router
  .route("/questionId/:questionId")
  .delete(questionControllers.deleteQuestion);

module.exports = router;
