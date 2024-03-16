const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const testCollection = client.db('experiment-labs').collection('emailTemplate');

module.exports.getAllTest = async (req, res, next) => {

    const result = await testCollection
        .find({})
        .toArray();

    res.send(result);

};

module.exports.saveATest = async (req, res, next) => {

    const data = req.body;
    const result = await testCollection.insertOne(data);
    res.send(result);

};


module.exports.deleteATest = async (req, res, next) => {

    const { id } = req.params;
    const result = await testCollection.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
};


module.exports.updateTest = async (req, res, next) => {

    const { id } = req.params;
    const updatedTask = req.body;
    const result = await testCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedTask }
    );
    res.send(result);
};