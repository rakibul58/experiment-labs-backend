const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const offerCollection = client.db('experiment-labs').collection('offers');

module.exports.postAnOffer = async (req, res, next) => {

    try {
        const newOffer = req.body;
        const result = await offerCollection.insertOne(newOffer);
        res.send({
            success: true,
            result
        });
    } catch (error) {
        res.send(error)
    }

};