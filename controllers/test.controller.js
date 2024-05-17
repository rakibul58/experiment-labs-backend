const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const testCollection = client.db('experiment-labs').collection('test');

module.exports.getAllTest = async (req, res, next) => {

    const projection = {
        _id: 0,
        taskName: 1,
        additionalFiles: 1
    }
    const result = await testCollection
        .find({ courseId: { $in: ["65c9bb2c3d84b05f04544899", "65c9bc3f5d6ab7134de4f35f"] } }, { projection }).toArray();

    res.send({ length: result.length, result });

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


module.exports.updateAllTests = async (req, res, next) => {
    try {

        // Define the regex filter and update operation
        const filter = {
            courseThumbnail: {
                $regex: 'https://experiment-labs-my-bucket.s3.eu-north-1.amazonaws.com',
                $options: 'i'  // case-insensitive search
            }
        };

        const updateDoc = {
            $set: {
                "courseThumbnail": {
                    $replaceAll: {
                        input: "$courseThumbnail",
                        find: "https://experiment-labs-my-bucket.s3.eu-north-1.amazonaws.com",
                        replacement: "https://d3vxxqkq57zz27.cloudfront.net"
                    }
                }
            }
        };

        // Perform the update operation
        const result = await testCollection.updateMany(filter, [updateDoc]);
        // const result = await testCollection.find(filter).toArray();
        res.send(result);
    } catch (err) {
        console.log(err.stack);
    }
}