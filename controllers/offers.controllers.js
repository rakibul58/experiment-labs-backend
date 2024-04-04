const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const offerCollection = client.db('experiment-labs').collection('offers');
const batchCollection = client.db("experiment-labs").collection("batches");
const courseCollection = client.db("experiment-labs").collection("courses");
const bundleCollection = client.db("experiment-labs").collection("bundles");

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
        // console.log(result);

        async function enrichOfferWithBatchAndCourseInfo(offer) {
            if (offer.selectedBatches) {
                // Fetching batches for current offer
                const batches = await batchCollection.find({ _id: { $in: offer.selectedBatches.map(id => new ObjectId(id)) } }).toArray();

                // For each batch, fetch the related course
                for (let batch of batches) {
                    if (batch.courseId) {
                        const course = await courseCollection.findOne({ _id: new ObjectId(batch.courseId) });
                        // Add the course info directly to the batch object
                        batch.courseInfo = course;
                    }
                }

                // Add enriched batches array to the result
                offer.batchesInfo = batches;
            }

            if (offer.bundleIds) {
                const bundles = await bundleCollection.find({ _id: { $in: offer.bundleIds.map(id => new ObjectId(id)) } }).toArray();
                for (let bundle of bundles) {
                    for (let courseItem of bundle.courses) {
                        const course = await courseCollection.findOne({ _id: new ObjectId(courseItem.courseId) });
                        const batch = await batchCollection.findOne({ _id: new ObjectId(courseItem.batchId) });
                        courseItem.courseInfo = course;
                        courseItem.batchInfo = batch;
                    }
                }
                offer.bundlesInfo = bundles;
            }


            return offer;
        }

        // Enrich each offer with its related batches and courses information
        const enrichedOffers = await Promise.all(result.map(enrichOfferWithBatchAndCourseInfo));

        // console.log(enrichedOffers);

        res.send({
            success: true,
            result
        });
    } catch (error) {
        res.send(error)
    }

};



module.exports.updateAnOffer = async (req, res, next) => {
    try {
        const id = req.params.id;
        const updatedOfferData = req.body;

        const result = await offerCollection.updateOne(
            { _id: new ObjectId(id) },
            { $set: updatedOfferData }
        );

        res.send({
            success: true,
            result
        });
    } catch (error) {
        res.send(error);
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


module.exports.getOffersByBatchId = async (req, res, next) => {
    try {
        const batchId = req.params.batchId;
        const result = await offerCollection.find({ selectedBatches: { $in: [batchId] } }).toArray();

        res.send({
            success: true,
            result
        });
    } catch (error) {
        res.send(error);
    }
};


module.exports.getOffersByBundleId = async (req, res, next) => {
    try {
        const bundleId = req.params.bundleId;
        const result = await offerCollection.find({ bundleIds: { $in: [bundleId] } }).toArray();

        res.send({
            success: true,
            result
        });

    } catch (error) {
        res.send(error);
    }
};