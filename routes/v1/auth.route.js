const express = require("express");
const authController = require("../../controllers/auth.controller");

const router = express.Router();

router.route("/").post(authController.createUser);
router.route("/token").post(authController.createTestToken);
router.route("/decode").post(authController.decodeToken);

module.exports = router;

