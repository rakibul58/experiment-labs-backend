const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const userCollection = client.db('experiment-labs').collection('users');

module.exports.getAnUserByEmail = async (req, res, next) => {

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


module.exports.getAllMentors = async (req, res, next) =>{

    const organizationId = req.params.organizationId;
    const rolesToMatch = ["execution mentor", "expert mentor"];
    const result = await userCollection.find({
        $and: [
            { "organizationId": organizationId },
            { "role": { $in: rolesToMatch } }
        ]
    }).toArray();

    res.send(result);
    
}