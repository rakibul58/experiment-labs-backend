const express = require("express");
const classControllers = require("../../controllers/classes.controller");

const router = express.Router();

router.route("/").post(classControllers.createAClass);

module.exports = router;
