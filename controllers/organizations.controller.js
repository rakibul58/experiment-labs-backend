const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const orgCollection = client.db('experiment-labs').collection('organizations');
const userCollection = client.db('experiment-labs').collection('users');

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
            role: "Admin"
        }
    };

    const newResult = await userCollection.updateOne(filter, updatedDoc, options);

    res.send({ result, newResult });

};