const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const bundleCollection = client.db("experiment-labs").collection("bundles");

module.exports.addABundle = async (req, res, next) => {
  const bundle = req.body;
  const result = await bundleCollection.insertOne(bundle);
  res.send(result);
};

module.exports.getABundle = async (req, res, next) => {
  const id = req.params.bundleId;
  const filter = { _id: new ObjectId(id) };
  const result = await bundleCollection.findOne(filter);
  res.send(result);
};

module.exports.getBundlesByOrganizationId = async (req, res, next) => {
  try {
    const id = req.params.organizationId;
    const filter = { organizationId: id };
    const result = await bundleCollection.find(filter).toArray();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.updateABundleData = async (req, res, next) => {
  try {
    const bundleId = req.params.bundleId;
    const updatedBundle = req.body;
    const result = await bundleCollection.updateOne(
      { _id: new ObjectId(bundleId) },
      { $set: updatedBundle }
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
