const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const courseCollection = client.db("experiment-labs").collection("courses");
const batchCollection = client.db("experiment-labs").collection("batches");
const weekCollection = client.db("experiment-labs").collection("weeks");
const chapterCollection = client.db("experiment-labs").collection("chapters");
const userCollection = client.db("experiment-labs").collection("users");

module.exports.getAllCourses = async (req, res, next) => {
  const courses = await courseCollection.find({}).toArray();
  res.send(courses);
};

module.exports.getACourseById = async (req, res, next) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const course = await courseCollection.findOne(filter);
  res.send(course);
};

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
    organization: course?.organization,
    price: course?.price,
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
        batchName: "Batch 1",
      },
    ],
  };

  const newResult = await weekCollection.insertOne(week);

  const weekId = newResult.insertedId;

  const chapter = {
    courseId: "" + courseId,
    weekId: "" + weekId,
    chapterName: "Topic 1",
    creator: course?.creator,
    date: new Date(),
    tasks: [],
  };
  const newChapter = await chapterCollection.insertOne(chapter);
  res.send({
    week: newResult,
    course: result,
    chapter: newChapter,
    batch: batchResult,
  });
};

module.exports.getCoursesByOrganizationId = async (req, res, next) => {
  const id = req.params.organizationId;
  const filter = { "organization.organizationId": id };
  const course = await courseCollection.find(filter).toArray();
  res.send(course);
};

module.exports.updateACourseData = async (req, res, next) => {
  const courseId = req.params.id;
  const updatedCourse = req.body;
  const result = await courseCollection.updateOne(
    { _id: new ObjectId(courseId) },
    { $set: updatedCourse }
  );
  res.send(result);
};

module.exports.getCoursesByUserId = async (req, res, next) => {
  try {
    const user = await userCollection.findOne({
      _id: new ObjectId(req.params.userId),
    });

    if (!user) {
      return res.status(404).send("User not found");
    }

    // Extract course IDs from the user's courses array
    const courseIds = user.courses
      .filter(
        (course) => course.courseId !== null && course.courseId !== undefined
      )
      .map((course) => {
        try {
          return new ObjectId(course.courseId);
        } catch (error) {
          throw error; // rethrow the error to stop further processing
        }
      });

    // Find all courses with the extracted IDs
    const courses = await courseCollection
      .find({ _id: { $in: courseIds } })
      .toArray();

    res.send(courses);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};
