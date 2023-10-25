const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const eventCollection = client.db('experiment-labs').collection('events');


module.exports.addAnEvent = async (req, res, next) => {
    const event = req.body;
    const result = await eventCollection.insertOne(event);
    res.send(result);
};

module.exports.getAllEvent = async (req, res, next) => {
    const result = await eventCollection.find({}).toArray();
    res.send(result);
};

module.exports.getAnEvent = async (req, res, next) => {
    const id = req.params.id;
    const filter = { _id: new ObjectId(id) };
    const result = await eventCollection.findOne(filter);
    res.send(result);
};