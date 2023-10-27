const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const redemptionAccessCollection = client.db('experiment-labs').collection('redemptionAccess');


module.exports.addAnAccessItem = async (req, res, next) => {
    const { organizationId, userId, accessItem } = req.body;

    const document = await redemptionAccessCollection.findOne({
        organizationId,
        userId,
    });

    if (!document) {
        const result = await redemptionAccessCollection.insertOne({
            organizationId,
            userId,
            accessItems: [
                {
                    redemptionItemName: accessItem.redemptionItemName,
                    itemValue: accessItem.itemValue,
                    dateAndTime: accessItem.dateAndTime,
                },
            ],
        });

        res.send(result);
    } else {


        const updatedDocument = await redemptionAccessCollection.findOneAndUpdate(
            { organizationId, userId },
            {
                $push: {
                    accessItems: {
                        redemptionItemName: accessItem.redemptionItemName,
                        itemValue: accessItem.itemValue,
                        dateAndTime: accessItem.dateAndTime,
                    },
                },
            },
            { returnDocument: 'after' } // This option ensures you get the updated document after the update operation
        );

        res.send(updatedDocument.value);
    }
};


module.exports.getARedemptionAccessByOrganizationIdAndUserId = async (req, res, next) => {
    const organizationId = req.params.organizationId;
    const userId = req.params.userId;
    const query = {
        'organizationId': organizationId,
        'userId': userId
    };

    try {
        const submissions = await redemptionAccessCollection.findOne(query);
        res.status(200).send(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
