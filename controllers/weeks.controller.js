const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const weekCollection = client.db('experiment-labs').collection('weeks');
const chapterCollection = client.db('experiment-labs').collection('chapters');

module.exports.addAWeek = async (req, res, next) => {
    const data = req.body;
    const courseId = data.courseId;
    const creator = data.creator;
    const newResult = await weekCollection.insertOne(data);
    const weekId = newResult.insertedId;
    const chapter = {
        courseId: "" + courseId,
        weekId: "" + weekId,
        chapterName: "Topic 1",
        creator: creator,
        date: new Date(),
        tasks: []
    };
    const newChapter = await chapterCollection.insertOne(chapter);

    res.send({
        "week": newResult,
        "chapter": newChapter
    });
};


module.exports.getWeeksByCourseId = async (req, res, next) => {
    const courseId = req.params.courseId;
    const query = { courseId: courseId };
    const courses = await weekCollection.find(query).toArray();
    res.send(courses);
};


module.exports.getAWeekById = async (req, res, next) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const week = await weekCollection.findOne(query);
    res.send(week);
};


module.exports.renameAWeek = async (req, res, next) => {
    const id = req.params.id;
    const updatedData = req.body;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
        $set: updatedData
    };
    const result = await weekCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
};


module.exports.deleteAWeek = async (req, res, next) => {
    const weekId = req.params.id;
    const query = { _id: new ObjectId(weekId) };
    const result = await weekCollection.deleteOne(query);
    res.send(result);
};