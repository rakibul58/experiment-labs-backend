const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const assignmentSubmitCollection = client
  .db("experiment-labs")
  .collection("assignments-submit");

module.exports.submitAnAssignment = async (req, res, next) => {
  const newSubmission = req.body;
  const query = {
    taskId: newSubmission.taskId,
    "submitter._id": newSubmission.submitter._id,
  };

  // Try to find an existing submission with the same taskId and submitter _id
  const existingSubmission = await assignmentSubmitCollection.findOne(query);

  if (existingSubmission) {
    // Update the existing submission
    const updateResult = await assignmentSubmitCollection.updateOne(query, {
      $set: newSubmission,
    });
    res.send(updateResult);
  } else {
    // Insert a new submission
    const insertResult = await assignmentSubmitCollection.insertOne(
      newSubmission
    );
    res.status(200).json(insertResult);
  }
};

module.exports.getAssignmentSubmissionsByTaskIdAndSubmitterId = async (
  req,
  res,
  next
) => {
  const taskId = req.params.taskId;
  const submitterId = req.params.submitterId;

  const query = {
    taskId: taskId,
    "submitter._id": submitterId,
  };

  try {
    const submissions = await assignmentSubmitCollection.find(query).toArray();

    if (submissions.length === 0) {
      return res
        .status(404)
        .json({ message: "No assignment submissions found" });
    }

    res.status(200).json(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAnAssignmentSubmission = async (req, res, next) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  try {
    const submissions = await assignmentSubmitCollection.findOne(query);

    if (submissions.length === 0) {
      return res
        .status(404)
        .json({ message: "No assignment submissions found" });
    }
    res.status(200).send(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAnAssignmentSubmissionsByOrganizationId = async (
  req,
  res,
  next
) => {
  const organizationId = req.params.organizationId;
  console.log(organizationId);
  const query = {
    "submitter.organizationId": organizationId,
  };

  try {
    const submissions = await assignmentSubmitCollection.find(query).toArray();

    if (submissions.length === 0) {
      return res.status(404).json({
        message: "No assignment submissions found for this organization",
      });
    }

    res.status(200).send(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.addResult = async (req, res, next) => {
  const submissionId = req.params.id;
  const result = req.body;
  try {
    // Find the assignment submission by its _id
    const submission = await assignmentSubmitCollection.findOne({
      _id: new ObjectId(submissionId),
    });

    if (!submission) {
      return res
        .status(404)
        .json({ message: "Assignment submission not found" });
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
      res.status(500).json({
        success: false,
        message: "Failed to add result to assignment submission",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.addReview = async (req, res, next) => {
  const submissionId = req.params.id;
  const review = req.body;
  try {
    // Find the assignment submission by its _id
    const submission = await assignmentSubmitCollection.findOne({
      _id: new ObjectId(submissionId),
    });

    if (!submission) {
      return res
        .status(404)
        .json({ message: "Assignment submission not found" });
    }

    // Add the result object to the submitter object
    submission.submitter.result.review = review;

    // Update the document in the collection
    const updateResult = await assignmentSubmitCollection.updateOne(
      { _id: new ObjectId(submissionId) },
      { $set: { "submitter.result": submission.submitter.result } }
    );

    if (updateResult.modifiedCount > 0) {
      res.status(200).json(updateResult);
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to add result to assignment submission",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getAssignmentSubmissionsBySubmitterId = async (
  req,
  res,
  next
) => {
  const submitterId = req.params.submitterId;
  const query = {
    "submitter._id": submitterId,
  };

  try {
    const submissions = await assignmentSubmitCollection.find(query).toArray();
    res.status(200).send(submissions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.assignMentorToSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { mentors } = req.body;

    // Validate that mentor data is provided
    if (!mentors || mentors?.length < 1) {
      console.log(mentors);
      return res
        .status(400)
        .json({ message: "Mentor data should be provided" });
    }

    // Update the submission document with the mentor data
    const updateResult = await assignmentSubmitCollection.updateOne(
      { _id: new ObjectId(submissionId) },
      { $set: { mentors: mentors } }
    );

    if (updateResult.modifiedCount === 1) {
      res.status(200).json({ message: "Mentor assigned successfully" });
    } else {
      res
        .status(404)
        .json({ message: "Submission not found or mentor not assigned" });
    }
  } catch (error) {
    console.error("Error assigning mentor to submission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// module.exports.assignMentorToMultipleSubmissions = async (req, res) => {
//   try {
//     const { submissionIds, mentor } = req.body;

//     // Validate that mentor data is provided
//     if (!mentor || typeof mentor !== "object") {
//       return res
//         .status(400)
//         .json({ message: "Mentor data should be provided" });
//     }

//     // Validate that submissionIds is an array and contains valid ObjectIds
//     if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "An array of submission IDs should be provided" });
//     }

//     const validSubmissionIds = submissionIds
//       .filter((id) => ObjectId.isValid(id))
//       .map((id) => new ObjectId(id));

//     if (validSubmissionIds.length === 0) {
//       return res
//         .status(400)
//         .json({ message: "No valid submission IDs provided" });
//     }

//     // Update the submission documents with the mentor data
//     const updateResult = await assignmentSubmitCollection.updateMany(
//       { _id: { $in: validSubmissionIds } },
//       { $set: { mentor: mentor } }
//     );

//     if (updateResult.modifiedCount > 0) {
//       res.status(200).json({
//         message: "Mentor assigned successfully to multiple submissions",
//       });
//     } else {
//       res
//         .status(404)
//         .json({ message: "No submissions found or mentor not assigned" });
//     }
//   } catch (error) {
//     console.error("Error assigning mentor to multiple submissions:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

module.exports.assignMentorToMultipleSubmissions = async (req, res) => {
  try {
    const { submissionIds, initialMentor, updateMentor } = req.body;

    // Validate that mentor data is provided
    if (!initialMentor || !updateMentor) {
      return res.status(400).json({
        message: "Initial mentor and update mentor data should be provided",
      });
    }

    // Validate that submissionIds is an array and contains valid ObjectIds
    if (!Array.isArray(submissionIds) || submissionIds.length === 0) {
      return res
        .status(400)
        .json({ message: "An array of submission IDs should be provided" });
    }

    const validSubmissionIds = submissionIds
      .filter((id) => ObjectId.isValid(id))
      .map((id) => new ObjectId(id));

    if (validSubmissionIds.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid submission IDs provided" });
    }

    // Loop through each submission ID to handle the mentor assignment logic
    for (const submissionId of validSubmissionIds) {
      // Find the submission
      const submission = await assignmentSubmitCollection.findOne({
        _id: submissionId,
      });

      if (!submission) {
        continue; // Skip this submission if not found
      }

      const mentors = submission.mentors || [];

      const initialMentorIndex = mentors.findIndex(
        (mentor) => mentor.mentorId === initialMentor.mentorId
      );
      const updateMentorExists = mentors.some(
        (mentor) => mentor.mentorId === updateMentor.mentorId
      );

      if (updateMentorExists) {
        // Remove the initial mentor
        mentors.splice(initialMentorIndex, 1);
      } else {
        // Replace the initial mentor with the update mentor
        mentors[initialMentorIndex] = {
          mentorId: updateMentor.mentorId,
          mentorEmail: updateMentor.mentorEmail,
          mentorRole: updateMentor.mentorRole,
        };
      }

      // Update the submission with the new mentors array
      await assignmentSubmitCollection.updateOne(
        { _id: submissionId },
        { $set: { mentors: mentors } }
      );
    }

    res.status(200).json({
      message: "Mentor updated successfully in multiple submissions",
    });
  } catch (error) {
    console.error("Error updating mentor in multiple submissions:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
