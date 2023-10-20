const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const courseCollection = client.db('experiment-labs').collection('courses');

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