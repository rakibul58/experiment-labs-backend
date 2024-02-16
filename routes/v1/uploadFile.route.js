const AWS = require("aws-sdk");
const express = require("express");
const multer = require("multer"); // Middleware for handling multipart/form-data

const router = express.Router();
const upload = multer(); // Initialize multer without any configuration for handling file uploads

AWS.config.update({
  accessKeyId: process.env.accessKeyId,
  secretAccessKey: process.env.secretAccessKey,
  region: process.env.region,
});

const s3 = new AWS.S3();
const bucketName = "experiment-labs-my-bucket";

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).send({ error: "No file uploaded" });
    }

    const params = {
      Bucket: bucketName,
      Key: file.originalname, // Use a unique key for your file
      Body: file.buffer,
    };

    const response = await s3.upload(params).promise();
    const fileUrl = response.Location;

    res.status(200).send({ fileUrl });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send({ error: "Error uploading file" });
  }
});

module.exports = router;
