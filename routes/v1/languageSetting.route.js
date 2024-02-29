const express = require("express");

const languageSettingController = require("../../controllers/languageSetting.controller");


const router = express.Router();

// add nav items
router
  .route("/addNavItemsName/:itemName/organizationId/:organizationId")
  .post(languageSettingController.addAdminNavItemsName);

// get NavItems By Organization
router
  .route("/getNavItemsByOrganization/organizationId/:organizationId")
  .get(languageSettingController.getAdminNavItemsByOrganization);

//add NavItems Details
router
  .route("/addNavItemsDetails/:itemName/organizationId/:organizationId")
  .post(languageSettingController.addAdminNavItemsDetails);

// get Item Details By Organization And Name
  router
  .route("/getItemDetailsByOrganizationAndName/:itemName/organizationsId/:organizationId")
  .get(languageSettingController.getAdminNavItemDetailsByOrganizationAndName);

//add add ContentManageSubDetails
router
  .route("/addContentManageSubDetails/:itemName/organizationId/:organizationId")
  .post(languageSettingController.addAdminContentManageSubDetails);


//get ContentManage SubDetails By Organization And Name
router
  .route("/getContentManageSubDetailsByOrganizationAndName/:itemName/organizationsId/:organizationId")
  .get(languageSettingController.getAdminContentManageSubDetailsByOrganizationAndName);

  //add Points And Redemptions Sub Details
router
.route("/addPointsAndRedemptionsSubDetails/:itemName/organizationId/:organizationId")
.post(languageSettingController.addAdminPointsAndRedemptionsSubDetails);

//get Points And Redemptions Sub Details By Organization And Name
router
  .route("/getPointsAndRedemptionsSubDetailsByOrganizationAndName/:itemName/organizationsId/:organizationId")
  .get(languageSettingController.getAdminPointsAndRedemptionsSubDetailsByOrganizationAndName);

  //add Skills Management SubDetails
router
.route("/addSkillsManagementSubDetails/:itemName/organizationId/:organizationId")
.post(languageSettingController.addSkillsManagementSubDetails);

//get Skills Management SubDetails By Organization And Name
 router
  .route("/getSkillsManagementSubDetailsByOrganizationAndName/:itemName/organizationsId/:organizationId")
  .get(languageSettingController.getSkillsManagementSubDetailsByOrganizationAndName); 

  //add Feedback SubDetails
  router
  .route("/addFeedbackSubDetails/:itemName/organizationId/:organizationId")
  .post(languageSettingController.addFeedbackSubDetails);

  //get Feedback SubDetails By Organization And Name
 router
 .route("/getFeedbackSubDetailsByOrganizationAndName/:itemName/organizationsId/:organizationId")
 .get(languageSettingController.getFeedbackSubDetailsByOrganizationAndName); 

  //add MyLearners SubDetails
  router
  .route("/addMyLearnersSubDetails/:itemName/organizationId/:organizationId")
  .post(languageSettingController.addMyLearnersSubDetails);

   //get MyLearners SubDetails By Organization And Name
 router
 .route("/getMyLearnersSubDetailsByOrganizationAndName/:itemName/organizationsId/:organizationId")
 .get(languageSettingController.getMyLearnersSubDetailsByOrganizationAndName); 

  //add MyLearners SubDetails
  router
  .route("/addUpdateOrganizationSubDetails/:itemName/organizationId/:organizationId")
  .post(languageSettingController.addUpdateOrganizationSubDetails);

     //get UpdateOrganization SubDetails By Organization And Name
 router
 .route("/getUpdateOrganizationSubDetailsByOrganizationAndName/:itemName/organizationsId/:organizationId")
 .get(languageSettingController.getUpdateOrganizationSubDetailsByOrganizationAndName); 

module.exports = router;