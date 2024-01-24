const express = require("express");
const assignmentSubmissionControllers = require("../../controllers/assignmentSubmissions.controller");

const router = express.Router();


router
    .route("/")
    .post(assignmentSubmissionControllers.submitAnAssignment);


router
    .route("/:id")
    .get(assignmentSubmissionControllers.getAnAssignmentSubmission);


router
    .route("/:id/result")
    .post(assignmentSubmissionControllers.addResult);


router
    .route("/:id/review")
    .post(assignmentSubmissionControllers.addReview);


router
    .route("/organizationId/:organizationId")
    .get(assignmentSubmissionControllers.getAnAssignmentSubmissionsByOrganizationId);


router
    .route("/taskId/:taskId/submitterId/:submitterId")
    .get(assignmentSubmissionControllers.getAssignmentSubmissionsByTaskIdAndSubmitterId);


router
    .route("/submitterId/:submitterId")
    .get(assignmentSubmissionControllers.getAssignmentSubmissionsBySubmitterId);


module.exports = router;