const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const questionsCollection = client
  .db("experiment-labs")
  .collection("questionBank");
const quizCollection = client.db("experiment-labs").collection("quizes");

module.exports.addQuestion = async (req, res, next) => {
  try {
    const question = req.body;

    const result = await questionsCollection.insertOne(question);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getQuestionsByOrganizationId = async (req, res) => {
  try {
    const organizationId = req.params.organizationId;

    // Find all questions belonging to the organization
    const questions = await questionsCollection
      .find({ organizationId })
      .toArray();

    // Check if any questions are found
    if (questions.length === 0) {
      return res
        .status(404)
        .json({ message: "No questions found for the organization" });
    }

    // Return the questions
    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions by organization ID:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getQuestionsForQuizAndBatch = async (req, res) => {
  try {
    const { quizId, batchId } = req.params;

    // Find the quiz by its ID
    const quiz = await quizCollection.findOne({ _id: ObjectId(quizId) });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Find the batch questions data for the given batch ID
    const batchQuestions = quiz.questions.find(
      (batch) => batch.batchId === batchId
    );
    if (!batchQuestions) {
      return res
        .status(404)
        .json({ message: "No questions found for the batch" });
    }

    // Collect questions from the questionBank using question IDs
    const questions = await questionsCollection
      .find({
        _id: {
          $in: batchQuestions.questions.map((questionId) =>
            ObjectId(questionId)
          ),
        },
      })
      .toArray();

    res.status(200).json(questions);
  } catch (error) {
    console.error("Error fetching questions for quiz and batch:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
