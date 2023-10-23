const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const quizCollection = client.db('experiment-labs').collection('quizes');

module.exports.addAQuestionToQuiz = async (req, res, next) => {
    const quizId = req.params.id;
    const newQuestion = req.body;

    let questionId;
    let isUniqueId = false;

    while (!isUniqueId) {
        // Generate a unique question ID
        questionId = new ObjectId().toString();

        // Check if the generated questionId is unique in the questions array
        const quiz = await quizCollection.findOne({ _id: new ObjectId(quizId) });
        const questionIds = quiz.questions.map(question => question.questionId);

        if (!questionIds.includes(questionId)) {
            isUniqueId = true;
        }
    }

    // Add the generated question ID to the new question object
    newQuestion.questionId = questionId;

    const updateResult = await quizCollection.updateOne(
        { _id: new ObjectId(quizId) },
        { $push: { questions: newQuestion } }
    );

    if (updateResult.modifiedCount > 0) {
        res.status(200).json({ success: true, questionId, updateResult });
    } else {
        res.status(400).json({ success: false, message: 'Failed to add question' });
    }
};


module.exports.updateAQuestionFromQuiz = async (req, res, next) => {
    const quizId = req.params.id;
    const questionId = req.params.questionId;
    const updatedQuestion = req.body;

    const updateResult = await quizCollection.updateOne(
        { _id: new ObjectId(quizId), 'questions.questionId': questionId },
        { $set: { 'questions.$': updatedQuestion } }
    );

    if (updateResult.modifiedCount > 0) {
        res.status(200).json({ success: true, updateResult });
    } else {
        res.status(400).json({ success: false, message: 'Failed to update question' });
    }
};


module.exports.getAQuestionByQuizIdAndQuestionId = async (req, res, next) => {
    const quizId = req.params.id;
    const questionId = req.params.questionId;

    const quiz = await quizCollection.findOne(
        { _id: new ObjectId(quizId), 'questions.questionId': questionId },
        { projection: { questions: { $elemMatch: { questionId: questionId } } } }
    );

    if (quiz && quiz.questions && quiz.questions.length > 0) {
        const question = quiz.questions[0];
        res.status(200).json(question);
    } else {
        res.status(404).json({ message: 'Question not found' });
    }
};