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



module.exports.getOfferByOrganizationId = async (req, res, next) => {

    try {
        const organizationId = req.params.organizationId;
        const result = await offerCollection.find({ organizationId }).toArray();
        res.send({
            success: true,
            result
        });
    } catch (error) {
        res.send(error)
    }

};



module.exports.deleteAnOffer = async (req, res, next) => {

    try {
        const id = req.params.id;
        const result = await offerCollection.deleteOne({ _id: new ObjectId(id) });
        res.send({
            success: true,
            result
        });

    } catch (error) {
        res.send(error)
    }

}