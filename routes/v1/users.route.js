const express = require("express");
const userControllers = require("../../controllers/users.controller");

const router = express.Router();

router
  .route("/")
  .get(userControllers.getAnUserByEmail)
  .post(userControllers.saveAUser);

router.route("/all").get(userControllers.getAllUser);

router.route("/students").get(userControllers.getAllStudents);

router
  .route("/mentors/organizationId/:organizationId")
  .get(userControllers.getAllMentors);

router
  .route("/mentors/organizationId/:organizationId/role/:role")
  .get(userControllers.getUsersByRoleAndOrgId);

router.route("/unpaidUsers/checkout").post(userControllers.checkoutPayment);

router.route("/unpaidUsers/verifyPayment").post(userControllers.verifyPayment);

router
  .route("/unpaidUsers/verifyBundlePayment")
  .post(userControllers.verifyBundlePayment);

router.route("/unpaidUsers/enroll").post(userControllers.enrollAStudent);

router.route("/refund").post(userControllers.refundPayment);

router.route("/addStudent").post(userControllers.addStudent);

router.route("/addBulkStudent").post(userControllers.addBulkStudent);

router.route("/addToCourse").post(userControllers.updateUsersInCourseBatch);

router
  .route("/students/:organizationId")
  .get(userControllers.getStudentsByOrganization);

router.route("/addDevice/:userEmail").put(userControllers.addDeviceToUser);

router
  .route("/removeDevice/:userEmail")
  .put(userControllers.removeDeviceFromUser);

router
  .route("/updateUser/email/:userEmail")
  .put(userControllers.updateUserData);

router
  .route("/getAllPaidInfo/organizationId/:organizationId")
  .get(userControllers.getAllPaidInfo);

router
  .route("/getAllPaidInfoWithPayerData/organizationId/:organizationId")
  .get(userControllers.getAllPaidInfoWithPayerData);

router.route("/interactions").post(userControllers.addAnInteraction);

router
  .route("/addOrUpdateUserWithCourse")
  .post(userControllers.addOrUpdateUserWithCourse);

router.route("/addOrUpdateMentor").post(userControllers.addOrUpdateMentor);

router
  .route("/addOrUpdateUserWithBundle")
  .post(userControllers.addOrUpdateUserWithBundle);
router
  .route("/getAllUserByBatchId/:batchId")
  .get(userControllers.getAllUserByBatchId);

router
  .route("/learnerId/:learnerId/assign-executionMentor")
  .put(userControllers.assignMentorToLearner);

module.exports = router;
