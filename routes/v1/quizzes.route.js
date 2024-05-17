const express = require("express");
const quizControllers = require("../../controllers/quizzes.controller");

const router = express.Router();

router.route("/:id").post(quizControllers.addAQuestionToQuiz);

router
  .route("/:id/questionId/:questionId")
  .get(quizControllers.getAQuestionByQuizIdAndQuestionId)
  .put(quizControllers.updateAQuestionFromQuiz);

router
  .route("/questionId/:questionId")
  .put(quizControllers.updateQuizQuestions);

module.exports = router;
