const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const chapterCollection = client.db("experiment-labs").collection("chapters");
const assignmentCollection = client
  .db("experiment-labs")
  .collection("assignments");
const classCollection = client.db("experiment-labs").collection("classes");
const readingCollection = client.db("experiment-labs").collection("readings");
const quizCollection = client.db("experiment-labs").collection("quizes");
const liveTestCollection = client.db("experiment-labs").collection("liveTests");
const videoCollection = client.db("experiment-labs").collection("videos");
const audioCollection = client.db("experiment-labs").collection("audios");
const fileCollection = client.db("experiment-labs").collection("files");
const scheduleCollection = client.db("experiment-labs").collection("schedule");

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
  res.send(result);
};

module.exports.renameAChapter = async (req, res, next) => {
  const id = req.params.id;
  const chapterName = req.body.chapterName;
  const filter = { _id: new ObjectId(id) };
  const options = { upsert: true };
  const updatedDoc = {
    $set: {
      chapterName: chapterName,
    },
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

module.exports.deleteChapterWithTasks = async (req, res) => {
  try {
    const chapterId = req.params.chapterId;

    // Find the chapter by its ID
    const chapter = await chapterCollection.findOne({
      _id: new ObjectId(chapterId),
    });
    if (!chapter) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    // Check if chapter has tasks
    if (!Array.isArray(chapter.tasks)) {
      console.log("No tasks found for the chapter");
      // Delete the chapter itself
      await chapterCollection.deleteOne({ _id: new ObjectId(chapterId) });
      return res.status(200).json({ message: "Chapter deleted successfully" });
    }

    // Loop through each task in the chapter and delete it
    for (const task of chapter.tasks) {
      await deleteTask(task.taskId, task.taskType);
    }

    // Delete the chapter itself
    await chapterCollection.deleteOne({ _id: new ObjectId(chapterId) });

    res
      .status(200)
      .json({ message: "Chapter and associated tasks deleted successfully" });
  } catch (error) {
    console.error("Error deleting chapter and tasks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

async function deleteTask(taskId, taskType) {
  let deleteResult;
  switch (taskType) {
    case "Assignment":
      deleteResult = await assignmentCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      break;
    case "Classes":
      deleteResult = await classCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      break;
    case "Reading":
      deleteResult = await readingCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      break;
    case "Quiz":
      deleteResult = await quizCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      break;
    case "Live Test":
      deleteResult = await liveTestCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      break;
    case "Video":
      deleteResult = await videoCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      break;
    case "Audio":
      deleteResult = await audioCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      break;
    case "Files":
      deleteResult = await fileCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      break;
    case "Schedule":
      deleteResult = await scheduleCollection.deleteOne({
        _id: new ObjectId(taskId),
      });
      break;
    default:
      console.error("Invalid task type");
  }
  return deleteResult;
}
