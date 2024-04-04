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

/* module.exports.getQuestionsForQuizAndBatch = async (req, res) => {
  try {
    const { quizId, batchId } = req.params;

    // Find the quiz by its ID
    const quiz = await quizCollection.findOne({ _id: ObjectId(quizId) });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Collect questions for the specified batch from the quiz data
    const questions = quiz.questions.reduce((acc, question) => {
      if (question.batches.includes(batchId)) {
        acc.push(question.questionId);
      }
      return acc;
    }, []);

    // Fetch the actual question data from the questionBank using question IDs
    const questionData = await questionsCollection
      .find({
        _id: { $in: questions.map((questionId) => ObjectId(questionId)) },
      })
      .toArray();

    res.status(200).json(questionData);
  } catch (error) {
    console.error("Error fetching questions for quiz and batch:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}; */

module.exports.getQuestionsForQuizAndBatch = async (req, res) => {
  try {
    const { quizId, batchId } = req.params;

    // Find the quiz by its ID
    const quiz = await quizCollection.findOne({ _id: ObjectId(quizId) });
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Get the array of question IDs in the same sequence as they appear in the quiz
    const questionIds = quiz.questions
      .filter((question) => question.batches.includes(batchId))
      .map((question) => question.questionId);

    // Fetch the actual question data from the questionBank using question IDs
    const questionData = await questionsCollection
      .find({
        _id: { $in: questionIds.map((questionId) => ObjectId(questionId)) },
      })
      .toArray();

    // Sort the question data based on the original sequence of question IDs in the quiz
    const sortedQuestions = questionIds.map((questionId) =>
      questionData.find((question) => question._id.toString() === questionId)
    );

    res.status(200).json(sortedQuestions);
  } catch (error) {
    console.error("Error fetching questions for quiz and batch:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.updateQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const updatedQuestion = req.body;

    // Update the question in the questionBank collection
    const result = await questionsCollection.updateOne(
      { _id: ObjectId(questionId) },
      { $set: updatedQuestion }
    );

    // Check if the update was successful
    if (result.modifiedCount === 1) {
      res.status(200).json({ message: "Question updated successfully" });
    } else {
      res.status(404).json({ message: "Question not found or not updated" });
    }
  } catch (error) {
    console.error("Error updating question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.deleteQuestion = async (req, res) => {
  try {
    const questionId = req.params.questionId;

    // Delete the question from the questionBank collection
    const result = await questionsCollection.deleteOne({
      _id: ObjectId(questionId),
    });

    // Check if the deletion was successful
    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Question deleted successfully" });
    } else {
      res.status(404).json({ message: "Question not found or not deleted" });
    }
  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
