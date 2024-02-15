const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const courseCategoryCollection = client.db("experiment-labs").collection("courseCategory");

module.exports.addCourseCategory = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
        const { courseCategoryName } = req.body;

        const category = { categoryName: courseCategoryName };
        // Check if organization exists
        const organization = await courseCategoryCollection.findOne({ organizationId });

        if (!organization) {
            // If organization doesn't exist, create a new one with the provided course category
            await courseCategoryCollection.insertOne({ organizationId, courseCategories: [category] });
        } else {
            // If organization exists, update its course categories by pushing the new category
            await courseCategoryCollection.updateOne(
                { organizationId },
                { $addToSet: { courseCategories: category } }
            );
        }
        res.status(200).send("Course category added successfully");
    } catch (error) {
        console.error("Error adding course category:", error);
        res.status(500).send("Internal server error");
    }
};

module.exports.getCourseCategory = async (req, res) => {
    try {
        const organizationId = req.params.organizationId;
  
      // Find the organization by its organizationId
      const organization = await courseCategoryCollection.findOne({ organizationId });
  
      if (!organization) {
        // If organization is not found, return 404
        res.status(404).send("Organization not found");
      } else {
        // If organization is found, return it
        res.status(200).json(organization);
      }
    } catch (error) {
      console.error("Error retrieving organization:", error);
      res.status(500).send("Internal server error");
    }
  };
  

