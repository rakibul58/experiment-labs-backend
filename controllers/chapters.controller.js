const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const chapterCollection = client.db('experiment-labs').collection('chapters');

module.exports.getAllChapters = async (req, res, next) => {
    const chapters = await chapterCollection.find({}).toArray();
    res.send(chapters);
};



module.exports.getChaptersByWeekId = async (req, res, next) => {
    const weekId = req.params.weekId;
    const query = { weekId: weekId };
    const chapters = await chapterCollection.find(query).toArray();
    res.send(chapters);
};


module.exports.getAChapterById = async (req, res, next) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    const chapter = await chapterCollection.findOne(query);
    res.send(chapter);
};


module.exports.addAChapter = async (req, res, next) => {
    const chapter = req.body;
    const result = await chapterCollection.insertOne(chapter);
    res.send(result)
};


module.exports.renameAChapter = async (req, res, next) => {
    const id = req.params.id;
    const chapterName = req.body.chapterName;
    const filter = { _id: new ObjectId(id) };
    const options = { upsert: true };
    const updatedDoc = {
        $set: {
            chapterName: chapterName
        }
    };
    const result = await chapterCollection.updateOne(filter, updatedDoc, options);
    res.send(result);
};


module.exports.getChaptersByCourseId = async (req, res, next) => {
    const courseId = req.params.courseId;
    const filter = { courseId: courseId };
    const result = await chapterCollection.find(filter).toArray();
    res.send(result);
};