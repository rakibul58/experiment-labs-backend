const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const assignmentCollection = client.db('experiment-labs').collection('assignments');
const classCollection = client.db('experiment-labs').collection('classes');
const readingCollection = client.db('experiment-labs').collection('readings');
const quizCollection = client.db('experiment-labs').collection('quizes');
const liveTestCollection = client.db('experiment-labs').collection('liveTests');
const videoCollection = client.db('experiment-labs').collection('videos');
const audioCollection = client.db('experiment-labs').collection('audios');
const fileCollection = client.db('experiment-labs').collection('files');
const chapterCollection = client.db('experiment-labs').collection('chapters');
const courseCollection = client.db('experiment-labs').collection('courses');

module.exports.getAllTasksByTaskTypeAndCourseId = async (req, res, next) => {
    const taskType = req.params.taskType;
    const courseId = req.params.courseId;
    const filter = { courseId: courseId };
    let result;

    switch (taskType) {
        case 'assignments':
            result = await assignmentCollection.find(filter).toArray();
            break;
        case 'classes':
            result = await classCollection.find(filter).toArray();
            break;
        case 'readings':
            result = await readingCollection.find(filter).toArray();
            break;
        case 'quizes':
            result = await quizCollection.find(filter).toArray();
            break;
        case 'liveTests':
            result = await liveTestCollection.find(filter).toArray();
            break;
        case 'videos':
            result = await videoCollection.find(filter).toArray();
            break;
        case 'audios':
            result = await audioCollection.find(filter).toArray();
            break;
        case 'files':
            result = await fileCollection.find(filter).toArray();
            break;
        default:
            return res.status(400).json({ error: 'Invalid task type' });
    }

    res.status(200).json(result);
};


module.exports.getTasksByTaskType = async (req, res, next) => {
    const taskType = req.params.taskType;
    const filter = {};
    let result;

    switch (taskType) {
        case 'assignments':
            result = await assignmentCollection.find(filter).toArray();
            break;
        case 'classes':
            result = await classCollection.find(filter).toArray();
            break;
        case 'readings':
            result = await readingCollection.find(filter).toArray();
            break;
        case 'quizes':
            result = await quizCollection.find(filter).toArray();
            break;
        case 'liveTests':
            result = await liveTestCollection.find(filter).toArray();
            break;
        case 'videos':
            result = await videoCollection.find(filter).toArray();
            break;
        case 'audios':
            result = await audioCollection.find(filter).toArray();
            break;
        case 'files':
            result = await fileCollection.find(filter).toArray();
            break;
        default:
            return res.status(400).json({ error: 'Invalid task type' });
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
        case 'assignments':
            taskTypeInput = "Assignment";
            result = await assignmentCollection.insertOne(task);
            break;
        case 'classes':
            taskTypeInput = "Classes";
            result = await classCollection.insertOne(task);
            break;
        case 'readings':
            taskTypeInput = "Reading";
            result = await readingCollection.insertOne(task);
            break;
        case 'quizes':
            taskTypeInput = "Quiz";
            result = await quizCollection.insertOne(task);
            break;
        case 'liveTests':
            taskTypeInput = "Live Test";
            result = await liveTestCollection.insertOne(task);
            break;
        case 'videos':
            taskTypeInput = "Video";
            result = await videoCollection.insertOne(task);
            break;
        case 'audios':
            taskTypeInput = "Audio";
            result = await audioCollection.insertOne(task);
            break;
        case 'files':
            taskTypeInput = "Files";
            result = await fileCollection.insertOne(task);
            break;
        default:
            return res.status(400).json({ error: 'Invalid task type' });
    }

    const filter = { _id: new ObjectId(chapterId) };
    const options = { upsert: true };

    const newTask = {
        taskId: "" + result?.insertedId,
        taskType: taskTypeInput,
        taskName,
        batches: batches,
        contentStage: task?.contentStage
    };

    const updatedDoc = {
        $push: {
            tasks: newTask
        }
    };

    const newResult = await chapterCollection.updateOne(filter, updatedDoc, options);

    if (newResult.modifiedCount > 0) {
        const filter = { _id: new ObjectId(courseId) };
        const options = { upsert: true };

        const updateCourse = {
            $inc: { totalTask: 1 } // Increment totalTask by 1
        };

        const updateResult = await courseCollection.updateOne(filter, updateCourse, options);

        // Check if the update was successful, and if totalTask field didn't exist, it will be created
        if (updateResult.modifiedCount > 0 || updateResult.upsertedCount > 0) {
            res.status(200).json({ result, newResult, updateResult });
        } else {
            res.status(500).json({ message: 'Failed to update course totalTask' });
        }
    } else {
        res.status(500).json({ message: 'Failed to update chapter tasks' });
    }
};


module.exports.getTasksByTaskTypeAndTaskId = async (req, res, next) => {
    const taskType = req.params.taskType;
    const taskId = req.params.taskId;
    const filter = { _id: new ObjectId(taskId) };
    let result;

    switch (taskType) {
        case 'assignments':
            result = await assignmentCollection.findOne(filter);
            break;
        case 'classes':
            result = await classCollection.findOne(filter);
            break;
        case 'readings':
            result = await readingCollection.findOne(filter);
            break;
        case 'quizes':
            result = await quizCollection.findOne(filter);
            break;
        case 'liveTests':
            result = await liveTestCollection.findOne(filter);
            break;
        case 'videos':
            result = await videoCollection.findOne(filter);
            break;
        case 'audios':
            result = await audioCollection.findOne(filter);
            break;
        case 'files':
            result = await fileCollection.findOne(filter);
            break;
        default:
            return res.status(400).json({ error: 'Invalid task type' });
    }

    res.status(200).json(result);
};


module.exports.deleteATask = async (req, res, next) => {
    const taskType = req.params.taskType;
    const taskId = req.params.taskId;

    let deleteResult, result;

    switch (taskType) {
        case 'assignments':
            deleteResult = await assignmentCollection.deleteOne({ _id: new ObjectId(taskId) });
            break;
        case 'classes':
            deleteResult = await classCollection.deleteOne({ _id: new ObjectId(taskId) });
            break;
        case 'readings':
            deleteResult = await readingCollection.deleteOne({ _id: new ObjectId(taskId) });
            break;
        case 'quizes':
            deleteResult = await quizCollection.deleteOne({ _id: new ObjectId(taskId) });
            break;
        case 'liveTests':
            deleteResult = await liveTestCollection.deleteOne({ _id: new ObjectId(taskId) });
            break;
        case 'videos':
            deleteResult = await videoCollection.deleteOne({ _id: new ObjectId(taskId) });
            break;
        case 'audios':
            deleteResult = await audioCollection.deleteOne({ _id: new ObjectId(taskId) });
            break;
        case 'files':
            deleteResult = await fileCollection.deleteOne({ _id: new ObjectId(taskId) });
            break;
        default:
            return res.status(400).json({ error: 'Invalid task type' });
    }

    // Remove task from chapter's tasks array
    if (deleteResult.deletedCount > 0) {
        const chapterFilter = { 'tasks.taskId': taskId };
        const chapterUpdate = {
            $pull: { tasks: { taskId } }
        };
        result = await chapterCollection.updateOne(chapterFilter, chapterUpdate);
    }

    res.status(200).json({ deleteResult, result });
};


module.exports.updateATask = async (req, res, next) => {
    const taskType = req.params.taskType;
    const taskId = req.params.taskId;
    const updatedTask = req.body;

    let updateResult, result;

    switch (taskType) {
        case 'assignments':
            updateResult = await assignmentCollection.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: updatedTask }
            );
            break;
        case 'classes':
            updateResult = await classCollection.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: updatedTask }
            );
            break;
        case 'readings':
            updateResult = await readingCollection.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: updatedTask }
            );
            break;
        case 'quizes':
            updateResult = await quizCollection.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: updatedTask }
            );
            break;
        case 'liveTests':
            updateResult = await liveTestCollection.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: updatedTask }
            );
            break;
        case 'videos':
            updateResult = await videoCollection.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: updatedTask }
            );
            break;
        case 'audios':
            updateResult = await audioCollection.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: updatedTask }
            );
            break;
        case 'files':
            updateResult = await fileCollection.updateOne(
                { _id: new ObjectId(taskId) },
                { $set: updatedTask }
            );
            break;
        default:
            return res.status(400).json({ error: 'Invalid task type' });
    }

    console.log(updateResult.modifiedCount);

    // Update chapter's task info as well
    if (updateResult.modifiedCount > 0) {
        const chapterFilter = { 'tasks.taskId': taskId };
        const find = await chapterCollection.findOne(chapterFilter);
        console.log(find);
        const chapterUpdate = {
            $set: { 'tasks.$.taskName': updatedTask.taskName, 'tasks.$.batches': updatedTask.batches }
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
        case 'assignments':
            result = await assignmentCollection.findOne(filter);
            break;
        case 'classes':
            result = await classCollection.findOne(filter);
            break;
        case 'readings':
            result = await readingCollection.findOne(filter);
            break;
        case 'quizes':
            result = await quizCollection.findOne(filter);
            break;
        case 'liveTests':
            result = await liveTestCollection.findOne(filter);
            break;
        case 'videos':
            result = await videoCollection.findOne(filter);
            break;
        case 'audios':
            result = await audioCollection.findOne(filter);
            break;
        case 'files':
            result = await fileCollection.findOne(filter);
            break;
        default:
            return res.status(400).json({ error: 'Invalid task type' });
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
            length: result1.length
        }
    }
    const result2 = await classCollection.find(filter).toArray();
    allData = {
        ...allData,
        classes: {
            data: result2,
            length: result2.length
        }
    };

    const result3 = await readingCollection.find(filter).toArray();
    allData = {
        ...allData,
        reading: {
            data: result3,
            length: result3.length
        }
    };

    const result4 = await quizCollection.find(filter).toArray();
    allData = {
        ...allData,
        quiz: {
            data: result4,
            length: result4.length
        }
    };

    const result5 = await liveTestCollection.find(filter).toArray();
    allData = {
        ...allData,
        liveTest: {
            data: result5,
            length: result5.length
        }
    };

    const result6 = await videoCollection.find(filter).toArray();
    allData = {
        ...allData,
        video: {
            data: result6,
            length: result6.length
        }
    };

    const result7 = await audioCollection.find(filter).toArray();
    allData = {
        ...allData,
        audio: {
            data: result7,
            length: result7.length
        }
    };

    const result8 = await fileCollection.find(filter).toArray();
    allData = {
        ...allData,
        files: {
            data: result8,
            length: result8.length
        }
    };



    res.status(200).json(allData);
};


