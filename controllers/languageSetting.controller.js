const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const languageCollection = client.db("experiment-labs").collection("language");

const handleDatabaseError = (res, error) => {
    console.error("Database Error:", error);
    res.status(500).send("Internal server error");
};

const addOrUpdateNavItem = async (organizationId, itemName, newItem) => {
    try {
        const organization = await languageCollection.findOneAndUpdate(
            { organizationId },
            { $set: { [`adminNavItems.${itemName}`]: newItem } },
            { upsert: true, returnOriginal: false }
        );
        return organization;
    } catch (error) {
        throw error;
    }
};

const getAdminNavItemsByOrganizationId = async (organizationId) => {
    try {
        const organization = await languageCollection.findOne({ organizationId });
        return organization ? organization.adminNavItems || {} : {};
    } catch (error) {
        throw error;
    }
};

const addOrUpdateAdminNavItemDetails = async (organizationId, itemName, itemDetail) => {
    try {
        const organization = await languageCollection.findOneAndUpdate(
            { organizationId },
            { $set: { [`adminNavItemDetails.${itemName}`]: itemDetail } },
            { upsert: true, returnOriginal: false }
        );
        return organization;
    } catch (error) {
        throw error;
    }
};

const getAdminNavItemDetailsByOrganizationAndName = async (organizationId, itemName) => {
    try {
        const organization = await languageCollection.findOne({ organizationId });
        if (!organization || !organization.adminNavItemDetails || !organization.adminNavItemDetails[itemName]) {
            return {}; // Return an empty object if itemName is not found
        }
        return organization.adminNavItemDetails[itemName];
    } catch (error) {
        throw error;
    }
};

const addOrUpdateAdminContentManageSubDetails = async (organizationId, itemName, subItemDetail) => {
    try {
        const organization = await languageCollection.findOneAndUpdate(
            { organizationId },
            { $set: { [`adminContentManageSubDetails.${itemName}`]: subItemDetail } },
            { upsert: true, returnOriginal: false }
        );
        return organization;
    } catch (error) {
        throw error;
    }
};

const getAdminContentManageSubDetailsByOrganizationAndName = async (organizationId, itemName) => {
    try {
        const organization = await languageCollection.findOne({ organizationId });
        if (!organization || !organization.adminContentManageSubDetails || !organization.adminContentManageSubDetails[itemName]) {
            return {}; // Return an empty object if itemName is not found
        }
        return organization.adminContentManageSubDetails[itemName];
    } catch (error) {
        throw error;
    }
};

const addOrUpdateAdminPointsAndRedemptionsSubDetails = async (organizationId, itemName, subItemDetail) => {
    try {
        const organization = await languageCollection.findOneAndUpdate(
            { organizationId },
            { $set: { [`adminPointsAndRedemptionsSubDetails.${itemName}`]: subItemDetail } },
            { upsert: true, returnOriginal: false }
        );
        return organization;
    } catch (error) {
        throw error;
    }
};
const addOrUpdateSkillsManagementSubDetails = async (organizationId, itemName, subItemDetail) => {
    try {
        const organization = await languageCollection.findOneAndUpdate(
            { organizationId },
            { $set: { [`adminSkillsManagementSubDetails.${itemName}`]: subItemDetail } },
            { upsert: true, returnOriginal: false }
        );
        return organization;
    } catch (error) {
        throw error;
    }
};
const addOrUpdateFeedbackSubDetails = async (organizationId, itemName, subItemDetail) => {
    try {
        const organization = await languageCollection.findOneAndUpdate(
            { organizationId },
            { $set: { [`adminFeedBackSubDetails.${itemName}`]: subItemDetail } },
            { upsert: true, returnOriginal: false }
        );
        return organization;
    } catch (error) {
        throw error;
    }
};
const addOrUpdateMyLearnersSubDetails = async (organizationId, itemName, subItemDetail) => {
    try {
        const organization = await languageCollection.findOneAndUpdate(
            { organizationId },
            { $set: { [`adminMyLearnersSubDetails.${itemName}`]: subItemDetail } },
            { upsert: true, returnOriginal: false }
        );
        return organization;
    } catch (error) {
        throw error;
    }
};
const addOrUpdateUpdateOrganizationSubDetails = async (organizationId, itemName, subItemDetail) => {
    try {
        const organization = await languageCollection.findOneAndUpdate(
            { organizationId },
            { $set: { [`adminUpdateOrganizationSubDetails.${itemName}`]: subItemDetail } },
            { upsert: true, returnOriginal: false }
        );
        return organization;
    } catch (error) {
        throw error;
    }
};

const getAdminPointsAndRedemptionsSubDetailsByOrganizationAndName = async (organizationId, itemName) => {
    try {
        const organization = await languageCollection.findOne({ organizationId });
        if (!organization || !organization.adminPointsAndRedemptionsSubDetails || !organization.adminPointsAndRedemptionsSubDetails[itemName]) {
            return {}; // Return an empty object if itemName is not found
        }
        return organization.adminPointsAndRedemptionsSubDetails[itemName];
    } catch (error) {
        throw error;
    }
};
const getSkillsManagementSubDetailsByOrganizationAndName = async (organizationId, itemName) => {
    try {
        const organization = await languageCollection.findOne({ organizationId });
        if (!organization || !organization.adminSkillsManagementSubDetails || !organization.adminSkillsManagementSubDetails[itemName]) {
            return {}; // Return an empty object if itemName is not found
        }
        return organization.adminSkillsManagementSubDetails[itemName];
    } catch (error) {
        throw error;
    }
};
const getFeedbackSubDetailsByOrganizationAndName = async (organizationId, itemName) => {
    try {
        const organization = await languageCollection.findOne({ organizationId });
        if (!organization || !organization.adminFeedBackSubDetails || !organization.adminFeedBackSubDetails[itemName]) {
            return {}; // Return an empty object if itemName is not found
        }
        return organization.adminFeedBackSubDetails[itemName];
    } catch (error) {
        throw error;
    }
};
const getMyLearnersSubDetailsByOrganizationAndName = async (organizationId, itemName) => {
    try {
        const organization = await languageCollection.findOne({ organizationId });
        if (!organization || !organization.adminMyLearnersSubDetails || !organization.adminMyLearnersSubDetails[itemName]) {
            return {}; // Return an empty object if itemName is not found
        }
        return organization.adminMyLearnersSubDetails[itemName];
    } catch (error) {
        throw error;
    }
};
const getUpdateOrganizationSubDetailsByOrganizationAndName = async (organizationId, itemName) => {
    try {
        const organization = await languageCollection.findOne({ organizationId });
        if (!organization || !organization.adminUpdateOrganizationSubDetails || !organization.adminUpdateOrganizationSubDetails[itemName]) {
            return {}; // Return an empty object if itemName is not found
        }
        return organization.adminUpdateOrganizationSubDetails[itemName];
    } catch (error) {
        throw error;
    }
};

// Express route handlers

module.exports.addAdminNavItemsName = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;
        const newItem = req.body;

        await addOrUpdateNavItem(organizationId, itemName, newItem);

        res.status(200).send("NavItem updated successfully");
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

module.exports.getAdminNavItemsByOrganization = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const adminNavItems = await getAdminNavItemsByOrganizationId(organizationId);
        res.status(200).json(adminNavItems);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

module.exports.addAdminNavItemsDetails = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;
        const itemDetail = req.body;

        await addOrUpdateAdminNavItemDetails(organizationId, itemName, itemDetail);

        res.status(200).send("Items Name updated successfully");
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

module.exports.getAdminNavItemDetailsByOrganizationAndName = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;

        const adminNavItemDetails = await getAdminNavItemDetailsByOrganizationAndName(organizationId, itemName);

        res.status(200).json(adminNavItemDetails);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

module.exports.addAdminContentManageSubDetails = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;
        const subItemDetail = req.body;

        await addOrUpdateAdminContentManageSubDetails(organizationId, itemName, subItemDetail);

        res.status(200).send("Content Manage Sub Details updated successfully");
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

module.exports.getAdminContentManageSubDetailsByOrganizationAndName = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;

        const adminContentManageSubDetails = await getAdminContentManageSubDetailsByOrganizationAndName(organizationId, itemName);

        res.status(200).json(adminContentManageSubDetails);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};

//add Points And Redemptions Sub Details
module.exports.addAdminPointsAndRedemptionsSubDetails = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;
        const subItemDetail = req.body;

        await addOrUpdateAdminPointsAndRedemptionsSubDetails(organizationId, itemName, subItemDetail);

        res.status(200).send("Points And RedemptionsSubDetails updated successfully");
    } catch (error) {
        handleDatabaseError(res, error);
    }
};
//get Points And Redemptions SubDetails By Organization And Name
module.exports.getAdminPointsAndRedemptionsSubDetailsByOrganizationAndName = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;

        const adminPointsAndRedemptionsSubDetails = await getAdminPointsAndRedemptionsSubDetailsByOrganizationAndName(organizationId, itemName);

        res.status(200).json(adminPointsAndRedemptionsSubDetails);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};
//add Skills Management SubDetails
module.exports.addSkillsManagementSubDetails = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;
        const subItemDetail = req.body;

        await addOrUpdateSkillsManagementSubDetails(organizationId, itemName, subItemDetail);

        res.status(200).send("Skills Management SubDetails updated successfully");
    } catch (error) {
        handleDatabaseError(res, error);
    }
};
//get Skills Management SubDetails By Organization And Name
module.exports.getSkillsManagementSubDetailsByOrganizationAndName = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;

        const skillsManagementSubDetails = await getSkillsManagementSubDetailsByOrganizationAndName(organizationId, itemName);

        res.status(200).json(skillsManagementSubDetails);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};
//add Feedback SubDetails
module.exports.addFeedbackSubDetails = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;
        const subItemDetail = req.body;

        await addOrUpdateFeedbackSubDetails(organizationId, itemName, subItemDetail);

        res.status(200).send("Feedback SubDetails updated successfully");
    } catch (error) {
        handleDatabaseError(res, error);
    }
};
//get Feedback SubDetails By Organization And Name
module.exports.getFeedbackSubDetailsByOrganizationAndName = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;

        const feedbackSubDetails = await getFeedbackSubDetailsByOrganizationAndName(organizationId, itemName);

        res.status(200).json(feedbackSubDetails);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};
//add my Learners SubDetails
module.exports.addMyLearnersSubDetails = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;
        const subItemDetail = req.body;

        await addOrUpdateMyLearnersSubDetails(organizationId, itemName, subItemDetail);

        res.status(200).send("MyLearners SubDetails updated successfully");
    } catch (error) {
        handleDatabaseError(res, error);
    }
};
//get MyLearners SubDetails By Organization And Name
module.exports.getMyLearnersSubDetailsByOrganizationAndName = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;

        const myLearnersSubDetails = await getMyLearnersSubDetailsByOrganizationAndName(organizationId, itemName);

        res.status(200).json(myLearnersSubDetails);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};
//add Update Organization SubDetails
module.exports.addUpdateOrganizationSubDetails = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;
        const subItemDetail = req.body;

        await addOrUpdateUpdateOrganizationSubDetails(organizationId, itemName, subItemDetail);

        res.status(200).send("Update Organization SubDetails updated successfully");
    } catch (error) {
        handleDatabaseError(res, error);
    }
};
//get Update Organization SubDetails By Organization And Name
module.exports.getUpdateOrganizationSubDetailsByOrganizationAndName = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const itemName = req.params.itemName;

        const myLearnersSubDetails = await getUpdateOrganizationSubDetailsByOrganizationAndName(organizationId, itemName);

        res.status(200).json(myLearnersSubDetails);
    } catch (error) {
        handleDatabaseError(res, error);
    }
};