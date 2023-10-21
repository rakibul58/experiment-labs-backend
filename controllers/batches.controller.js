const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const batchCollection = client.db('experiment-labs').collection('batches');

module.exports.getBatchesByCourseId = async (req, res, next) => {
    const courseId = req.params.courseId;
    const filter = { courseId: courseId };
    const result = await batchCollection.find(filter).toArray();
    res.send(result);
};