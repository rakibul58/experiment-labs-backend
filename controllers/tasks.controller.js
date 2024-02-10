const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
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
const chapterCollection = client.db("experiment-labs").collection("chapters");
const courseCollection = client.db("experiment-labs").collection("courses");
const userCollection = client.db("experiment-labs").collection("users");

module.exports.getAllTasksByTaskTypeAndCourseId = async (req, res, next) => {
  const taskType = req.params.taskType;
  const courseId = req.params.courseId;
  const filter = { courseId: courseId };
  let result;

  switch (taskType) {
    case "assignments":
      result = await assignmentCollection.find(filter).toArray();
      break;
    case "classes":
      result = await classCollection.find(filter).toArray();
      break;
    case "readings":
      result = await readingCollection.find(filter).toArray();
      break;
    case "quizes":
      result = await quizCollection.find(filter).toArray();
      break;
    case "liveTests":
      result = await liveTestCollection.find(filter).toArray();
      break;
    case "videos":
      result = await videoCollection.find(filter).toArray();
      break;
    case "audios":
      result = await audioCollection.find(filter).toArray();
      break;
    case "files":
      result = await fileCollection.find(filter).toArray();
      break;
    case "schedule":
      result = await scheduleCollection.find(filter).toArray();
      break;
    default:
      return res.status(400).json({ error: "Invalid task type" });
  }

  res.status(200).json(result);
};

module.exports.getTasksByTaskType = async (req, res, next) => {
  const taskType = req.params.taskType;
  const filter = {};
  let result;

  switch (taskType) {
    case "assignments":
      result = await assignmentCollection.find(filter).toArray();
      break;
    case "classes":
      result = await classCollection.find(filter).toArray();
      break;
    case "readings":
      result = await readingCollection.find(filter).toArray();
      break;
    case "quizes":
      result = await quizCollection.find(filter).toArray();
      break;
    case "liveTests":
      result = await liveTestCollection.find(filter).toArray();
      break;
    case "videos":
      result = await videoCollection.find(filter).toArray();
      break;
    case "audios":
      result = await audioCollection.find(filter).toArray();
      break;
    case "files":
      result = await fileCollection.find(filter).toArray();
      break;
    default:
      return res.status(400).json({ error: "Invalid task type" });
  }

  res.send(result);
};

module.exports.addATask = async (req, res, next) => {
  const chapterId = req.body.chapterId;
  const courseId = req.body.courseId;
  const taskType = req.params.taskType;
  const task = req.body;
  const batches = task.batches;
  const taskName = task.taskName;
  let taskTypeInput;
  let result;

  switch (taskType) {
    case "assignments":
      taskTypeInput = "Assignment";
      result = await assignmentCollection.insertOne(task);
      break;
    case "classes":
      taskTypeInput = "Classes";
      result = await classCollection.insertOne(task);
      break;
    case "readings":
      taskTypeInput = "Reading";
      result = await readingCollection.insertOne(task);
      break;
    case "quizes":
      taskTypeInput = "Quiz";
      result = await quizCollection.insertOne(task);
      break;
    case "liveTests":
      taskTypeInput = "Live Test";
      result = await liveTestCollection.insertOne(task);
      break;
    case "videos":
      taskTypeInput = "Video";
      result = await videoCollection.insertOne(task);
      break;
    case "audios":
      taskTypeInput = "Audio";
      result = await audioCollection.insertOne(task);
      break;
    case "files":
      taskTypeInput = "Files";
      result = await fileCollection.insertOne(task);
      break;
    case "schedule":
      taskTypeInput = "Schedule";
      result = await scheduleCollection.insertOne(task);
      break;
    default:
      return res.status(400).json({ error: "Invalid task type" });
  }

  const filter = { _id: new ObjectId(chapterId) };
  const options = { upsert: true };

  const newTask = {
    taskId: "" + result?.insertedId,
    taskType: taskTypeInput,
    taskName,
    batches: batches,
    contentStage: task?.contentStage,
  };

  const updatedDoc = {
    $push: {
      tasks: newTask,
    },
  };

  const newResult = await chapterCollection.updateOne(
    filter,
    updatedDoc,
    options
  );

  if (newResult.modifiedCount > 0) {
    const filter = { _id: new ObjectId(courseId) };
    const options = { upsert: true };

    const updateCourse = {
      $inc: { totalTask: 1 }, // Increment totalTask by 1
    };

    const updateResult = await courseCollection.updateOne(
      filter,
      updateCourse,
      options
    );

    // Check if the update was successful, and if totalTask field didn't exist, it will be created
    if (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0) {
      res.status(200).json({ result, newResult, updateResult });
    } else {
      res.status(500).json({ message: "Failed to update course totalTask" });
    }
  } else {
    res.status(500).json({ message: "Failed to update chapter tasks" });
  }
};

module.exports.getTasksByTaskTypeAndTaskId = async (req, res, next) => {
  const taskType = req.params.taskType;
  const taskId = req.params.taskId;
  const filter = { _id: new ObjectId(taskId) };
  let result;

  switch (taskType) {
    case "assignments":
      result = await assignmentCollection.findOne(filter);
      break;
    case "classes":
      result = await classCollection.findOne(filter);
      break;
    case "readings":
      result = await readingCollection.findOne(filter);
      break;
    case "quizes":
      result = await quizCollection.findOne(filter);
      break;
    case "liveTests":
      result = await liveTestCollection.findOne(filter);
      break;
    case "videos":
      result = await videoCollection.findOne(filter);
      break;
    case "audios":
      result = await audioCollection.findOne(filter);
      break;
    case "files":
      result = await fileCollection.findOne(filter);
      break;
    case "schedule":
      result = await scheduleCollection.findOne(filter);
      break;
    default:
      return res.status(400).json({ error: "Invalid task type" });
  }

  res.status(200).json(result);
};

module.exports.deleteATask = async (req, res, next) => {
  const taskType = req.params.taskType;
  const taskId = req.params.taskId;
  const batches = req.body;
  let deleteResult, result;

  if (batches.length === 0) {
    switch (taskType) {
      case "assignments":
        deleteResult = await assignmentCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        break;
      case "classes":
        deleteResult = await classCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        break;
      case "readings":
        deleteResult = await readingCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        break;
      case "quizes":
        deleteResult = await quizCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        break;
      case "liveTests":
        deleteResult = await liveTestCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        break;
      case "videos":
        deleteResult = await videoCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        break;
      case "audios":
        deleteResult = await audioCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        break;
      case "files":
        deleteResult = await fileCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        break;
      case "schedule":
        deleteResult = await scheduleCollection.deleteOne({
          _id: new ObjectId(taskId),
        });
        break;
      default:
        return res.status(400).json({ error: "Invalid task type" });
    }

    // Remove task from chapter's tasks array
    if (deleteResult.deletedCount > 0) {
      const chapterFilter = { "tasks.taskId": taskId };
      const chapterUpdate = {
        $pull: { tasks: { taskId } },
      };
      result = await chapterCollection.updateOne(chapterFilter, chapterUpdate);
    }
  } else {
    switch (taskType) {
      case "assignments":
        deleteResult = await assignmentCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { batches: batches } }
        );
        break;
      case "classes":
        deleteResult = await classCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { batches: batches } }
        );
        break;
      case "readings":
        deleteResult = await readingCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { batches: batches } }
        );
        break;
      case "quizes":
        deleteResult = await quizCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { batches: batches } }
        );
        break;
      case "liveTests":
        deleteResult = await liveTestCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { batches: batches } }
        );
        break;
      case "videos":
        deleteResult = await videoCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { batches: batches } }
        );
        break;
      case "audios":
        deleteResult = await audioCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { batches: batches } }
        );
        break;
      case "files":
        deleteResult = await fileCollection.updateOne(
          { _id: new ObjectId(taskId) },
          { $set: { batches: batches } }
        );
        break;
      default:
        return res.status(400).json({ error: "Invalid task type" });
    }

    // Remove task from chapter's tasks array
    if (deleteResult.modifiedCount > 0) {
      const chapterFilter = { "tasks.taskId": taskId };
      const chapterUpdate = {
        $set: { "tasks.$.batches": batches },
      };
      result = await chapterCollection.updateOne(chapterFilter, chapterUpdate);
    }
  }

  res.status(200).json({ deleteResult, result });
};

module.exports.updateATask = async (req, res, next) => {
  const taskType = req.params.taskType;
  const taskId = req.params.taskId;
  const updatedTask = req.body;

  let updateResult, result;

  switch (taskType) {
    case "assignments":
      updateResult = await assignmentCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask }
      );
      break;
    case "classes":
      updateResult = await classCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask }
      );
      break;
    case "readings":
      updateResult = await readingCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask }
      );
      break;
    case "quizes":
      updateResult = await quizCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask }
      );
      break;
    case "liveTests":
      updateResult = await liveTestCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask }
      );
      break;
    case "videos":
      updateResult = await videoCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask }
      );
      break;
    case "audios":
      updateResult = await audioCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask }
      );
      break;
    case "files":
      updateResult = await fileCollection.updateOne(
        { _id: new ObjectId(taskId) },
        { $set: updatedTask }
      );
      break;
    default:
      return res.status(400).json({ error: "Invalid task type" });
  }

  console.log(updateResult.modifiedCount);

  // Update chapter's task info as well
  if (updateResult.modifiedCount > 0) {
    const chapterFilter = { "tasks.taskId": taskId };
    const chapterUpdate = {
      $set: {
        "tasks.$.taskName": updatedTask.taskName,
        "tasks.$.batches": updatedTask.batches,
      },
    };
    result = await chapterCollection.updateOne(chapterFilter, chapterUpdate);
  }

  res.status(200).json({ updateResult, result });
};

module.exports.getTasksByTaskTypeAndChapterId = async (req, res, next) => {
  const taskType = req.params.taskType;
  const chapterId = req.params.chapterId;
  const filter = { chapterId: chapterId };
  let result;

  switch (taskType) {
    case "assignments":
      result = await assignmentCollection.findOne(filter);
      break;
    case "classes":
      result = await classCollection.findOne(filter);
      break;
    case "readings":
      result = await readingCollection.findOne(filter);
      break;
    case "quizes":
      result = await quizCollection.findOne(filter);
      break;
    case "liveTests":
      result = await liveTestCollection.findOne(filter);
      break;
    case "videos":
      result = await videoCollection.findOne(filter);
      break;
    case "audios":
      result = await audioCollection.findOne(filter);
      break;
    case "files":
      result = await fileCollection.findOne(filter);
      break;
    default:
      return res.status(400).json({ error: "Invalid task type" });
  }

  res.send(result);
};

module.exports.getTasksByChapterId = async (req, res, next) => {
  const chapterId = req.query.chapterId;
  const filter = { chapterId: chapterId };
  let allData = {};

  const result1 = await assignmentCollection.find(filter).toArray();
  allData = {
    ...allData,
    assignment: {
      data: result1,
      length: result1.length,
    },
  };
  const result2 = await classCollection.find(filter).toArray();
  allData = {
    ...allData,
    classes: {
      data: result2,
      length: result2.length,
    },
  };

  const result3 = await readingCollection.find(filter).toArray();
  allData = {
    ...allData,
    reading: {
      data: result3,
      length: result3.length,
    },
  };

  const result4 = await quizCollection.find(filter).toArray();
  allData = {
    ...allData,
    quiz: {
      data: result4,
      length: result4.length,
    },
  };

  const result5 = await liveTestCollection.find(filter).toArray();
  allData = {
    ...allData,
    liveTest: {
      data: result5,
      length: result5.length,
    },
  };

  const result6 = await videoCollection.find(filter).toArray();
  allData = {
    ...allData,
    video: {
      data: result6,
      length: result6.length,
    },
  };

  const result7 = await audioCollection.find(filter).toArray();
  allData = {
    ...allData,
    audio: {
      data: result7,
      length: result7.length,
    },
  };

  const result8 = await fileCollection.find(filter).toArray();
  allData = {
    ...allData,
    files: {
      data: result8,
      length: result8.length,
    },
  };

  res.status(200).json(allData);
};

module.exports.addTaskCompletionDetails = async (req, res, next) => {
  const chapterId = req.params.chapterId;
  const taskId = req.params.taskId;
  const participantChapter = req.body.participantChapter;
  const participantTask = req.body.participantTask;
  const courseId = req.body.courseId;
  const courseName = req.body.courseName;
  const taskType = req.params.taskType;

  // res.send({taskId})

  try {
    const chapterDocument = await chapterCollection.findOne({
      _id: new ObjectId(chapterId),
    });

    if (!chapterDocument) {
      return res.status(404).json({ message: "Chapter not found" });
    }

    const task = chapterDocument.tasks.find(
      (task) => task.taskId === taskId && task.taskType === taskType
    );

    if (!task) {
      return res
        .status(404)
        .json({ message: "Task not found within the chapter" });
    }

    if (!task.participants) {
      task.participants = [];
    }

    // Check if the participant with the same ID already exists in the task
    const existingParticipantChapterIndex = task.participants.findIndex(
      (existing) => existing.email === participantChapter.email
    );

    if (existingParticipantChapterIndex !== -1) {
      // Participant already exists, update their information
      task.participants[existingParticipantChapterIndex] = participantChapter;
    } else {
      // Participant is new, add them to the task
      task.participants.push(participantChapter);
    }

    // Update the document in the chapter collection
    await chapterCollection.updateOne(
      { _id: new ObjectId(chapterId) },
      { $set: { tasks: chapterDocument.tasks } }
    );

    // Find the task collection based on task type
    let taskCollection;
    switch (taskType) {
      case "Reading":
        taskCollection = readingCollection;
        break;
      case "Quiz":
        taskCollection = quizCollection;
        break;
      case "Assignment":
        taskCollection = assignmentCollection;
        break;
      case "Classes":
        taskCollection = classCollection;
        break;
      case "LiveTests":
        taskCollection = liveTestCollection;
        break;
      case "Video":
        taskCollection = videoCollection;
        break;
      case "Audio":
        taskCollection = audioCollection;
        break;
      case "Files":
        taskCollection = fileCollection;
        break;
      case "Schedule":
        taskCollection = scheduleCollection;
        break;
      default:
        return res.status(400).json({ message: "Invalid task type" });
    }

    const taskDocument = await taskCollection.findOne({
      _id: new ObjectId(taskId),
    });

    if (!taskDocument) {
      return res
        .status(404)
        .json({ message: "Task not found within the task collection" });
    }

    if (!taskDocument.participants) {
      taskDocument.participants = [];
    }

    // Check if the participant with the same ID already exists in the task collection
    const existingParticipantTaskIndex = taskDocument.participants.findIndex(
      (existing) =>
        existing.participant.email === participantTask.participant.email
    );

    if (existingParticipantTaskIndex !== -1) {
      // Participant already exists, update their information
      taskDocument.participants[existingParticipantTaskIndex] = participantTask;
    } else {
      // Participant is new, add them to the task collection
      taskDocument.participants.push(participantTask);
    }

    // Update the document in the task collection
    const result = await taskCollection.updateOne(
      { _id: new ObjectId(taskId) },
      { $set: { participants: taskDocument.participants } }
    );

    if (result) {
      // Search for the user in userCollection using their email
      const user = await userCollection.findOne({
        email: participantTask.participant.email,
      });

      if (user) {
        // Check if the user already has a course entry with the same courseId
        const existingCourseIndex = user.courses
          ? user.courses.findIndex(
              (course) => course.courseId === chapterDocument?.courseId
            )
          : -1;

        if (existingCourseIndex !== -1) {
          // User has an existing course entry, update completedTask count
          user.courses[existingCourseIndex].completedTask++;
        } else {
          // User doesn't have a course entry for this courseId, create a new one
          const newCourseEntry = {
            courseId: chapterDocument?.courseId,
            // courseName: courseName,
            completedTask: 1, // Initialize completedTask to 1 for the new course
          };
          if (!user.courses) {
            user.courses = []; // Initialize the courses array if it doesn't exist
          }
          user.courses.push(newCourseEntry);
        }

        // Update the user document in userCollection
        await userCollection.updateOne(
          { email: participantTask.participant.email },
          { $set: { courses: user.courses } }
        );
      }

      res.status(200).json(result);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.updateEvent = async (req, res) => {
  const userEmail = req.params.email; // Assuming the email is part of the URL parameters
  const newEventsData = req.body;

  try {
    // Check if the user with the given email exists
    const userExists = await scheduleCollection.findOne({
      "usersession.user.email": userEmail,
    });

    if (userExists) {
      // Update the existing events or create a new events array
      const updateResult = await scheduleCollection.updateOne(
        { "usersession.user.email": userEmail },
        {
          $set: { "usersession.user.email": userEmail, events: newEventsData },
        }
      );

      if (updateResult.matchedCount > 0) {
        res
          .status(200)
          .json({ success: true, message: "Events replaced successfully" });
      } else {
        res.status(404).json({
          success: false,
          message: "User not found or no matching document",
        });
      }
    } else {
      // If user doesn't exist, create a new document
      const insertResult = await scheduleCollection.insertOne({
        usersession: { user: { email: userEmail } },
        events: [newEventsData],
      });

      if (insertResult.insertedCount > 0) {
        res.status(201).json({
          success: true,
          message: "User and events created successfully",
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to create user and events",
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.addEvent = async (req, res, next) => {
  const eventId = req.params.id;
  const newEvent = req.body;
  try {
    // Try to find the document by its _id
    const existingEvent = await scheduleCollection.findOne({
      _id: new ObjectId(eventId),
    });

    if (!existingEvent) {
      // If the document doesn't exist, create a new one with the initial events array
      const createResult = await scheduleCollection.insertOne({
        _id: new ObjectId(eventId),
        events: [newEvent],
      });

      if (createResult.insertedCount > 0) {
        res.status(200).json(createResult);
      } else {
        res
          .status(500)
          .json({ success: false, message: "Failed to create and add event" });
      }
    } else {
      // If the document exists, push the new event into the existing events array
      const updateResult = await scheduleCollection.updateOne(
        { _id: new ObjectId(eventId) },
        { $push: { events: newEvent } }
      );

      if (updateResult.matchedCount > 0) {
        res.status(200).json(updateResult);
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to add event to existing document",
        });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.removeFile = async (req, res, next) => {
  const assignmentId = req.params.taskId;
  try {
    const result = await assignmentCollection.updateOne(
      { _id: new ObjectId(assignmentId) }, // Use the correct identifier for your assignment
      { $set: { file: "" } }
    );

    res.send({
      success: true,
      result,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error removing file data", error: error.message });
  }
};
