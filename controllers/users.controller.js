const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const userCollection = client.db('experiment-labs').collection('users');

module.exports.getAUserByEmail = async (req, res, next) => {

    const email = req.query.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    res.send(user);

};

module.exports.saveAUser = async (req, res, next) => {

    const user = req.body;

    const email = await userCollection.findOne({ email: user.email });

    if (email) {
        return res.status(400).json({ error: "sorry a user already exists" });
    }

    const result = await userCollection.insertOne(user);
    res.send(result);

};