const express = require("express");
const certificateTemplates = require("../../controllers/certificateTemplates.controller");

const router = express.Router();

router.route("/").post(certificateTemplates.addOrUpdateCertificateTemplate);

router
  .route("/courseId/:courseId/batchId/:batchId")
  .get(certificateTemplates.getCertificateTemplate);

module.exports = router;
