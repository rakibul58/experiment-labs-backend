const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const assignmentSubmitCollection = client.db('experiment-labs').collection('assignments-submit');

module.exports.submitAnAssignment = async (req, res, next) => {
    const newSubmission = req.body;
    const query = {
        'taskId': newSubmission.taskId,
        'submitter._id': newSubmission.submitter._id
    };

    
    // Try to find an existing submission with the same taskId and submitter _id
    const existingSubmission = await assignmentSubmitCollection.findOne(query);

    if (existingSubmission) {
        // Update the existing submission
        const updateResult = await assignmentSubmitCollection.updateOne(query, { $set: newSubmission });
        res.send(updateResult);

    } else {
        // Insert a new submission
        const insertResult = await assignmentSubmitCollection.insertOne(newSubmission);
        res.status(200).json(insertResult);
    }
};


module.exports.getAssignmentSubmissionsByTaskIdAndSubmitterId = async (req, res, next) => {
    const taskId = req.params.taskId;
    const submitterId = req.params.submitterId;

    const query = {
        taskId: taskId,
        'submitter._id': submitterId
    };

    try {
        const submissions = await assignmentSubmitCollection.find(query).toArray();

        if (submissions.length === 0) {
            return res.status(404).json({ message: 'No assignment submissions found' });
        }

        res.status(200).json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.getAnAssignmentSubmission = async (req, res, next) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) };
    try {
        const submissions = await assignmentSubmitCollection.findOne(query);

        if (submissions.length === 0) {
            return res.status(404).json({ message: 'No assignment submissions found' });
        }
        res.status(200).send(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.getAnAssignmentSubmissionsByOrganizationId = async (req, res, next) => {
    const organizationId = req.params.organizationId;
    console.log(organizationId);
    const query = {
        'submitter.organizationId': organizationId
    };

    try {
        const submissions = await assignmentSubmitCollection.find(query).toArray();

        if (submissions.length === 0) {
            return res.status(404).json({ message: 'No assignment submissions found for this organization' });
        }

        res.status(200).send(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.addResult = async (req, res, next) => {
    const submissionId = req.params.id;
    const result = req.body;
    try {
        // Find the assignment submission by its _id
        const submission = await assignmentSubmitCollection.findOne({ _id: new ObjectId(submissionId) });

        if (!submission) {
            return res.status(404).json({ message: 'Assignment submission not found' });
        }

        // Add the result object to the submitter object
        submission.submitter.result = result;

        // Update the document in the collection
        const updateResult = await assignmentSubmitCollection.updateOne(
            { _id: new ObjectId(submissionId) },
            { $set: { submitter: submission.submitter } }
        );

        if (updateResult.modifiedCount > 0) {
            res.status(200).json(updateResult);
        } else {
            res.status(500).json({ success: false, message: 'Failed to add result to assignment submission' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.addReview = async (req, res, next) => {
    const submissionId = req.params.id;
    const review = req.body;
    try {
        // Find the assignment submission by its _id
        const submission = await assignmentSubmitCollection.findOne({ _id: new ObjectId(submissionId) });

        if (!submission) {
            return res.status(404).json({ message: 'Assignment submission not found' });
        }

        // Add the result object to the submitter object
        submission.submitter.result.review = review;

        // Update the document in the collection
        const updateResult = await assignmentSubmitCollection.updateOne(
            { _id: new ObjectId(submissionId) },
            { $set: { 'submitter.result': submission.submitter.result } }
        );

        if (updateResult.modifiedCount > 0) {
            res.status(200).json(updateResult);
        } else {
            res.status(500).json({ success: false, message: 'Failed to add result to assignment submission' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports.getAssignmentSubmissionsBySubmitterId = async (req, res, next) => {
    const submitterId = req.params.submitterId;
    const query = {
        'submitter._id': submitterId
    };

    try {
        const submissions = await assignmentSubmitCollection.find(query).toArray();
        res.status(200).send(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};