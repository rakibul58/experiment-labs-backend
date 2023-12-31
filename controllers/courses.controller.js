const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const courseCollection = client.db('experiment-labs').collection('courses');
const batchCollection = client.db('experiment-labs').collection('batches');
const weekCollection = client.db('experiment-labs').collection('weeks');
const chapterCollection = client.db('experiment-labs').collection('chapters');

module.exports.getAllCourses = async (req, res, next) => {
    const courses = await courseCollection.find({}).toArray();
    res.send(courses);
};


module.exports.getACourseById = async (req, res, next) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const course = await courseCollection.findOne(filter);
    res.send(course);
}


module.exports.addACourse = async (req, res, next) => {
    const course = req.body;
    const result = await courseCollection.insertOne(course);
    const courseId = result.insertedId;

    const batch = {
        batchName: "Batch 1",
        batchStartDate: "",
        batchEndDate: "",
        participants: [],
        courseId: "" + courseId,
        creator: course?.creator,
        organization: course?.organization
    };

    const batchResult = await batchCollection.insertOne(batch);

    const batchId = batchResult.insertedId;

    const week = {
        courseId: "" + courseId,
        weekNo: 1,
        weekName: "Week 1",
        organization: course?.organization,
        creator: course?.creator,
        schedules: [
            {
                weekStartDate: "",
                weekEndDate: "",
                batchId: "" + batchId,
                batchName: "Batch 1"
            }
        ]
    };

    const newResult = await weekCollection.insertOne(week);

    const weekId = newResult.insertedId;

    const chapter = {
        courseId: "" + courseId,
        weekId: "" + weekId,
        chapterName: "Topic 1",
        creator: course?.creator,
        date: new Date(),
        tasks: []
    };
    const newChapter = await chapterCollection.insertOne(chapter);
    res.send({
        "week": newResult,
        "course": result,
        "chapter": newChapter,
        "batch": batchResult
    });
}


module.exports.getCoursesByOrganizationId = async (req, res, next) => {
    const id = req.params.organizationId;
    const filter = { "organization.organizationId": id };
    const course = await courseCollection.find(filter).toArray();
    res.send(course);
}