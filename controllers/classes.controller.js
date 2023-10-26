const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const classCollection = client.db('experiment-labs').collection('classes');

module.exports.addAnAttendee = async (req, res, next) => {
    const classId = req.params.id;
    const attendee = req.body.attendee;

    // Find the class by its _id
    const classDocument = await classCollection.findOne({ _id: new ObjectId(classId) });

    if (!classDocument) {
        return res.status(404).json({ message: 'Class not found' });
    }
    // Add attendees to the class
    if (!classDocument.attendees) {
        classDocument.attendees = [];
    }

    // Check if an attendee with the same email already exists in the class
    const duplicateAttendee = classDocument.attendees.find(newAttendee => attendee.email === newAttendee.email);

    if (duplicateAttendee) {
        return res.send({ message: 'Attendee with the same email already exists in the class' });
    }

    classDocument.attendees = [...classDocument.attendees, attendee];

    // Update the document in the collection
    const updateResult = await classCollection.updateOne(
        { _id: new ObjectId(classId) },
        { $set: { attendees: classDocument.attendees } }
    );

    if (updateResult.modifiedCount > 0) {
        res.status(200).json(updateResult);
    } else {
        res.status(500).json({ success: false, message: 'Failed to add attendees to the class' });
    }
};