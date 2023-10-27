const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const givenFeedbackCollection = client.db('experiment-labs').collection('givenFeedbacks');


module.exports.postAFeedback = async (req, res, next) => {
    const { organizationId, taskId, courseId, givenFeedback, taskName } = req.body;

    const document = await givenFeedbackCollection.findOne({
        organizationId,
        taskId,
        courseId,
        taskName,
    });

    if (!document) {
        const result = await givenFeedbackCollection.insertOne({
            organizationId,
            taskId,
            courseId,
            taskName,
            givenFeedbacks: [
                {

                    submitterId: givenFeedback?.submitterId,
                    submitterName: givenFeedback?.submitterName,
                    categories: givenFeedback?.categories,
                    comment: givenFeedback?.comment,
                    dateAndTime: givenFeedback?.dateAndTime,
                },
            ],
        });

        res.send(result);
    } else {


        const updatedDocument = await givenFeedbackCollection.findOneAndUpdate(
            { organizationId, taskId, courseId, taskName },
            {
                $push: {
                    givenFeedbacks: {
                        submitterId: givenFeedback?.submitterId,
                        submitterName: givenFeedback?.submitterName,
                        categories: givenFeedback?.categories,
                        comment: givenFeedback?.comment,
                        dateAndTime: givenFeedback?.dateAndTime,
                    },
                },
            },
            { returnDocument: 'after' } // This option ensures you get the updated document after the update operation
        );

        res.send(updatedDocument.value);
        console.log(updatedDocument.value)
    }
};


module.exports.getAFeedbackByTaskId = async (req, res, next) => {
    const id = req.params.taskId;
    const filter = { taskId: id };
    const result = await givenFeedbackCollection.findOne(filter);
    res.send(result);
};


module.exports.getFeedbackByCourseId = async (req, res, next) => {
    const courseId = req.params.courseId;
    const filter = { courseId: courseId };
    const result = await givenFeedbackCollection.find(filter).toArray();
    res.send(result);
};