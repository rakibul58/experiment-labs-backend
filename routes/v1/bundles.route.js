const express = require("express");
const bundleControllers = require("../../controllers/bundles.controller");

const router = express.Router();

router.route("/").post(bundleControllers.addABundle);

router.route("/bundleId/:bundleId").get(bundleControllers.getABundle);

router
  .route("/updateBundle/bundleId/:bundleId")
  .put(bundleControllers.updateABundleData);

router
  .route("/organizationId/:organizationId")
  .get(bundleControllers.getBundlesByOrganizationId);

module.exports = router;
