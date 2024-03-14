const express = require("express");
const mailController = require("../../controllers/mail.controller");

const router = express.Router();

router
    .route("/")
    .post(mailController.sendAnEmail);


router
    .route("/templateId/:templateId")
    .put(mailController.updateEmailActionTemplate);


router
    .route("/organizationId/:organizationId")
    .get(mailController.getEmailActionTemplateByOrganizationId)
    .post(mailController.createSESEmailTemplate);


module.exports = router;