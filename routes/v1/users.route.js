const express = require("express");
const userControllers = require("../../controllers/users.controller");

const router = express.Router();

router
  .route("/")
  .get(userControllers.getAnUserByEmail)
  .post(userControllers.saveAUser);

router
  .route("/mentors/organizationId/:organizationId")
  .get(userControllers.getAllMentors);

router.route("/unpaidUsers/checkout").post(userControllers.checkoutPayment);

router.route("/unpaidUsers/verifyPayment").post(userControllers.verifyPayment);

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

module.exports = router;
