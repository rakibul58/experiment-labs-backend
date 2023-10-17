const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const testCollection = client.db('experiment-labs').collection('test');

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