const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const orgCollection = client.db("experiment-labs").collection("organizations");
const userCollection = client.db("experiment-labs").collection("users");
const emailTemplateCollection = client
  .db("experiment-labs")
  .collection("emailTemplate");
const crypto = require("crypto");

const secretKey = process.env.SECRET_KEY;
const algorithm = "aes-256-cbc";

// Encrypt function
const encrypt = (text) => {
  const iv = crypto.randomBytes(16); // Ensure a new IV is generated for each encryption call
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    Buffer.from(secretKey, "hex"),
    iv
  );
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return { iv: iv.toString("hex"), encryptedData: encrypted };
};

// Decrypt function
const decrypt = (text) => {
  const decipher = crypto.createDecipheriv(
    algorithm,
    Buffer.from(secretKey, "hex"),
    Buffer.from(text.iv, "hex")
  );
  let decrypted = decipher.update(Buffer.from(text.encryptedData, "hex"));
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

module.exports.createAnOrganization = async (req, res, next) => {
  const user = req.body;
  const result = await orgCollection.insertOne(user);
  const organizationId = result.insertedId;
  const email = user.email;
  const filter = { email: email };
  const options = { upsert: true };

  const updatedDoc = {
    $set: {
      organizationId: "" + organizationId,
      organizationName: "" + user?.organizationName,
      role: "Admin",
    },
  };

  const newResult = await userCollection.updateOne(filter, updatedDoc, options);
  res.send({ result, newResult });
};

module.exports.updateAnOrganization = async (req, res, next) => {
  const orgId = req.params.id;
  const updatedOrg = req.body;

  try {
    const existingOrg = await orgCollection.findOne({
      _id: new ObjectId(orgId),
    });

    if (!existingOrg) {
      return res.status(404).json({ error: "Organization not found" });
    }

    // Update the organization in the collection
    const result = await orgCollection.updateOne(
      { _id: new ObjectId(orgId) },
      { $set: updatedOrg }
    );

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.updateEncryptedData = async (req, res, next) => {
  const orgId = req.params.id;
  const { emailIntegration } = req.body;
  const {
    sendFrom,
    accessKeyId,
    secretAccessKey,
    region,
    templateName,
    email,
  } = emailIntegration;

  try {
    const existingOrg = await orgCollection.findOne({
      _id: new ObjectId(orgId),
    });

    if (!existingOrg) {
      return res.status(404).json({ error: "Organization not found" });
    }

    const encryptedAccessKeyId = encrypt(accessKeyId);
    const encryptedSecretAccessKey = encrypt(secretAccessKey);
    const encryptedRegion = encrypt(region);

    const updatedOrg = {
      emailIntegration: {
        sendFrom,
        accessKeyId: encryptedAccessKeyId,
        secretAccessKey: encryptedSecretAccessKey,
        region: encryptedRegion,
        templateName,
        email,
      },
    };

    // console.log(updatedOrg);

    // Update the organization in the collection
    const result = await orgCollection.updateOne(
      { _id: new ObjectId(orgId) },
      { $set: updatedOrg }
    );

    res.send(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.getAnOrganization = async (req, res, next) => {
  const orgId = req.params.id;
  const result = await orgCollection.findOne({ _id: new ObjectId(orgId) });
  res.send(result);
};

module.exports.getEncryptedData = async (req, res, next) => {
  const orgId = req.params.id;
  const result = await orgCollection.findOne({ _id: new ObjectId(orgId) });
  const {
    sendFrom,
    accessKeyId,
    secretAccessKey,
    region,
    templateName,
    email,
  } = result?.emailIntegration;

  const decryptedAccessKeyId = decrypt(accessKeyId);
  const decryptedSecretAccessKey = decrypt(secretAccessKey);
  const decryptedRegion = decrypt(region);

  // console.log(
  //     {
  //         sendFrom,
  //         accessKeyId: decryptedAccessKeyId,
  //         secretAccessKey: decryptedSecretAccessKey,
  //         region: decryptedRegion,
  //         templateName
  //     }
  // );
  const emailTemplates = await emailTemplateCollection
    .find({ organizationId: orgId, email: email })
    .toArray();

  res.send({
    sendFrom,
    accessKeyId: decryptedAccessKeyId,
    secretAccessKey: decryptedSecretAccessKey,
    region: decryptedRegion,
    templateName,
    email,
    emailTemplates,
  });
};

module.exports.getOrganizationByOrgDefaultUrl = async (req, res) => {
  try {
    const { orgDefaultUrl } = req.body; // Extract orgDefaultUrl from the request body

    // Find the organization by its orgDefaultUrl
    const organization = await orgCollection.findOne({ orgDefaultUrl });

    if (organization) {
      // If organization is found, return it
      res.status(200).json({ organization });
    }
    // else {
    //   // If organization is not found, return 404
    //   res.status(404).json({ message: "Organization not found" });
    // }
  } catch (error) {
    console.error("Error retrieving organization:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
