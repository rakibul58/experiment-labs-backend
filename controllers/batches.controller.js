const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const batchCollection = client.db('experiment-labs').collection('batches');
const chapterCollection = client.db('experiment-labs').collection('chapters');
const weekCollection = client.db('experiment-labs').collection('weeks');
const userCollection = client.db('experiment-labs').collection('users');

module.exports.getBatchesByCourseId = async (req, res, next) => {
    const courseId = req.params.courseId;
    const filter = { courseId: courseId };
    const result = await batchCollection.find(filter).toArray();
    res.send(result);
};


module.exports.createABatch = async (req, res, next) => {
    const data = req.body;
    const participants = data.user.participants;
    const batch = data.batch;

    const batchResult = await batchCollection.insertOne(batch);
    const batchId = "" + batchResult.insertedId;
    let participantsResult;

    if (participants.length > 0) {
        const courses = [
            {
                batchId: batchId,
                batchName: batch?.batchName,
                courseId: batch?.courseId,
                completedTask: 0
            }
        ];

        const participantsWithCourses = participants.map(participant => ({
            ...participant,
            courses: courses
        }));


        participantsResult = await userCollection.insertMany(participantsWithCourses);
    }
    else {
        participantsResult = { message: "No Participant" }
    }

    const courseId = batch?.courseId;

    const newSchedule = {
        batchId,
        batch: batch?.batchName,
        weekEndDate: "",
        weekStartDate: ""
    }

    const weeksWithCourseId = await weekCollection.find({ courseId: courseId }).toArray();

    // Update each week to push the new schedule into the schedules array
    const updatePromises = weeksWithCourseId.map(async (week) => {
        if (!week.schedules) {
            week.schedules = [];
            week.schedules.push({
                batchId,
                batch: batch?.batchName,
                weekEndDate: week?.weekStartDate ? week?.weekStartDate : "",
                weekStartDate: week?.weekEndDate ? week?.weekEndDate : ""
            });
        }
        else
            week.schedules.push(newSchedule);

        // Update the week in the database
        const updateResult = await weekCollection.updateOne(
            { _id: new ObjectId(week._id) },
            { $set: { schedules: week.schedules } }
        );

        return updateResult;
    });

    // Execute all update operations in parallel
    const weekResult = await Promise.all(updatePromises);


    const chapters = await chapterCollection.find({ courseId: courseId }).toArray();

    // Update each chapter
    const chapterPromises = chapters.map(async (chapter) => {

        if (!chapter.tasks) {
            return;
        }

        const nonAssignmentOrClassesTasks = chapter.tasks.filter(
            (task) => task.taskType !== 'Assignment' && task.taskType !== 'Classes'
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
        "participant": participantsResult,
        "batch": batchResult,
        "week": weekResult,
        "chapter": chapterResult
    });
}