const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const courseCollection = client.db('experiment-labs').collection('courses');

module.exports.getAllCourses = async (req, res, next) => {

    const courses = await courseCollection.find({}).toArray();
    res.send(courses);

};