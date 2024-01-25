const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const certificateTemplateCollection = client
  .db("experiment-labs")
  .collection("certificateTemplates");

module.exports.addOrUpdateCertificateTemplate = async (req, res, next) => {
  try {
    const templateData = req.body;

    const { courseId, batchId } = templateData;

    // Check if a template with the same courseId and batchId exists
    const existingTemplate = await certificateTemplateCollection.findOne({
      courseId,
      batchId,
    });

    if (existingTemplate) {
      // If a template exists, update it
      const updateResult = await certificateTemplateCollection.updateOne(
        { courseId, batchId },
        { $set: templateData }
      );

      res.json({
        message: "Certificate template updated successfully",
        updatedTemplate: templateData,
      });
    } else {
      // If no template exists, insert a new one
      const insertResult = await certificateTemplateCollection.insertOne(
        templateData
      );

      res.json({
        message: "Certificate template added successfully",
        insertedTemplate: templateData,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getCertificateTemplate = async (req, res, next) => {
  try {
    const { courseId, batchId } = req.params;

    // Find the certificate template with the given courseId and batchId
    const template = await certificateTemplateCollection.findOne({
      courseId,
      batchId,
    });

    if (template) {
      res.json({
        message: "Certificate template found",
        template,
      });
    } else {
      res.status(404).json({
        message: "Certificate template not found",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
