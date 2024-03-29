const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const batchCollection = client.db("experiment-labs").collection("batches");
const chapterCollection = client.db("experiment-labs").collection("chapters");
const weekCollection = client.db("experiment-labs").collection("weeks");
const userCollection = client.db("experiment-labs").collection("users");
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

module.exports.getBatchesByCourseId = async (req, res, next) => {
  const courseId = req.params.courseId;
  const filter = { courseId: courseId };
  const result = await batchCollection.find(filter).toArray();
  res.send(result);
};

module.exports.getBatchesByBatchId = async (req, res, next) => {
  try {
    const batchId = req.params.batchId;
    const filter = { _id: new ObjectId(batchId) };
    const result = await batchCollection.find(filter).toArray();
    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.createABatch = async (req, res, next) => {
  const data = req.body;
  // const participants = data.user.participants;
  const batch = data.batch;

  const batchResult = await batchCollection.insertOne(batch);
  const batchId = "" + batchResult.insertedId;
  // let participantsResult;

  // if (participants.length > 0) {
  //   const courses = [
  //     {
  //       batchId: batchId,
  //       batchName: batch?.batchName,
  //       courseId: batch?.courseId,
  //       completedTask: 0,
  //     },
  //   ];

  //   participantsResult = await Promise.all(
  //     participants.map(async (participant) => {
  //       const existingParticipant = await userCollection.findOne({
  //         email: participant.email,
  //       });

  //       if (existingParticipant) {
  //         // Ensure courses is initialized as an array
  //         existingParticipant.courses = existingParticipant.courses || [];
  //         // Participant already exists, update the course
  //         existingParticipant.courses.push(...courses);

  //         // Update the existing participant in the collection
  //         await userCollection.updateOne(
  //           { _id: existingParticipant._id },
  //           { $set: { courses: existingParticipant.courses } }
  //         );

  //         return existingParticipant;
  //       } else {
  //         const login = await firebaseUtils.createUserWithEmailAndPassword(
  //           participant.email,
  //           participant.password
  //         );

  //         if (!login.success) {
  //           console.error(
  //             `Failed to create user in Firebase for email: ${participant.email}`
  //           );
  //           // Handle error case: Maybe remove the user from MongoDB?
  //         } else {
  //           // Participant does not exist, create a new participant with the course
  //           const newUser = {
  //             ...participant,
  //             courses: courses,
  //           };

  //           // Insert the new participant into the collection
  //           const result = await userCollection.insertOne(newUser);
  //           return result;
  //         }
  //       }
  //     })
  //   );
  // } else {
  //   participantsResult = { message: "No Participant" };
  // }

  const courseId = batch?.courseId;

  const newSchedule = {
    batchId,
    batch: batch?.batchName,
    weekEndDate: "",
    weekStartDate: "",
  };

  const weeksWithCourseId = await weekCollection
    .find({ courseId: courseId })
    .toArray();

  // Update each week to push the new schedule into the schedules array
  const updatePromises = weeksWithCourseId.map(async (week) => {
    if (!week.schedules) {
      week.schedules = [];
      week.schedules.push({
        batchId,
        batch: batch?.batchName,
        weekEndDate: week?.weekStartDate ? week?.weekStartDate : "",
        weekStartDate: week?.weekEndDate ? week?.weekEndDate : "",
      });
    } else week.schedules.push(newSchedule);

    // Update the week in the database
    const updateResult = await weekCollection.updateOne(
      { _id: new ObjectId(week._id) },
      { $set: { schedules: week.schedules } }
    );

    return updateResult;
  });

  // Execute all update operations in parallel
  const weekResult = await Promise.all(updatePromises);

  const chapters = await chapterCollection
    .find({ courseId: courseId })
    .toArray();

  // Update each chapter
  const chapterPromises = chapters.map(async (chapter) => {
    if (!chapter.tasks) {
      return;
    }

    const nonAssignmentOrClassesTasks = chapter.tasks.filter(
      (task) => task.taskType !== "Assignment" && task.taskType !== "Classes"
    );

    if (nonAssignmentOrClassesTasks.length > 0) {
      // Initialize the "batches" array inside each non-Assignment and non-Classes task
      nonAssignmentOrClassesTasks.forEach((task) => {
        if (!task.batches) {
          task.batches = [];
        }

        // Push a new batch object into the "batches" array
        const newBatch = {
          batchId: batchId, // Replace with your batchId
          batchName: batch?.batchName, // Replace with your batchName
        };

        task.batches.push(newBatch);
      });
    }

    // Update the chapter in the database
    const updateResult = await chapterCollection.updateOne(
      { _id: new ObjectId(chapter._id) },
      { $set: { tasks: chapter.tasks } }
    );

    return updateResult;
  });

  // Execute all update operations in parallel
  const chapterResult = await Promise.all(chapterPromises);

  res.send({
    participant: participantsResult,
    batch: batchResult,
    week: weekResult,
    chapter: chapterResult,
  });
};

/* module.exports.updateACourseData = async (req, res, next) => {
  try {
    const batchId = req.params.batchId;
    const updatedBatch = req.body;
    const result = await batchCollection.updateOne(
      { _id: new ObjectId(batchId) },
      { $set: updatedBatch }
    );

    

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
}; */

module.exports.updateABatchData = async (req, res, next) => {
  try {
    const batchId = req.params.batchId;
    const updatedBatch = req.body;

    const result = await batchCollection.updateOne(
      { _id: new ObjectId(batchId) },
      { $set: updatedBatch }
    );

    const updateBatchName = await chapterCollection.updateMany(
      { "tasks.batches.batchId": batchId },
      {
        $set: {
          "tasks.$[].batches.$[batchIndex].batchName": updatedBatch.batchName,
        },
      },
      { arrayFilters: [{ "batchIndex.batchId": batchId }] }
    );

    // Check if either of the update operations failed
    if (result.modifiedCount === 1 && updateBatchName.modifiedCount > 0) {
      // Both updates were successful
      res.status(200).json({ message: "Batch data updated successfully" });
    } else if (result.modifiedCount !== 1) {
      // Batch update failed
      res.status(404).json({ message: "Batch not found or not updated" });
    } else {
      // Batch name update failed
      res.status(404).json({ message: "Batch name not updated" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

// API endpoint for deleting a batch
module.exports.deleteBatch = async (req, res) => {
  try {
    const batchId = req.params.batchId;

    // Find and delete the batch
    const deleteResult = await batchCollection.deleteOne({
      _id: new ObjectId(batchId),
    });
    if (deleteResult.deletedCount === 0) {
      return res.status(404).json({ message: "Batch not found" });
    }

    // Update tasks associated with the deleted batch
    await updateTasksAndChaptersForDeletedBatch(batchId);

    res.status(200).json({ message: "Batch deleted successfully" });
  } catch (error) {
    console.error("Error deleting batch:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Function to update tasks and chapters associated with the deleted batch
async function updateTasksAndChaptersForDeletedBatch(batchId) {
  // Update tasks in each task collection
  const taskCollections = [
    assignmentCollection,
    classCollection,
    readingCollection,
    quizCollection,
    liveTestCollection,
    videoCollection,
    audioCollection,
    fileCollection,
    scheduleCollection,
  ];

  for (const collection of taskCollections) {
    await collection.updateMany(
      { "batches.batchId": batchId },
      { $pull: { batches: { batchId } } }
    );
  }

  // Update chapters
  await chapterCollection.updateMany(
    { "tasks.batches.batchId": batchId },
    { $pull: { "tasks.$[elem].batches": { batchId } } },
    { arrayFilters: [{ "elem.batches.batchId": batchId }] }
  );
}
