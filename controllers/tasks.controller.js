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