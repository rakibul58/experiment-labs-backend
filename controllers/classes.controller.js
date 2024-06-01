const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const classCollection = client.db("experiment-labs").collection("classes");
const axios = require("axios");

module.exports.addAnAttendee = async (req, res, next) => {
  const classId = req.params.id;
  const attendee = req.body.attendee;

  // Find the class by its _id
  const classDocument = await classCollection.findOne({
    _id: new ObjectId(classId),
  });

  if (!classDocument) {
    return res.status(404).json({ message: "Class not found" });
  }
  // Add attendees to the class
  if (!classDocument.attendees) {
    classDocument.attendees = [];
  }

  // Check if an attendee with the same email already exists in the class
  const duplicateAttendee = classDocument.attendees.find(
    (newAttendee) => attendee.email === newAttendee.email
  );

  if (duplicateAttendee) {
    return res.send({
      message: "Attendee with the same email already exists in the class",
    });
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
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to add attendees to the class",
      });
  }
};

module.exports.createAMeeting = async (req, res, next) => {
  try {
    // const clientID = process.env.zoom_clientId;
    // const clientSecret = process.env.zoom_clientSecret;
    // const redirectURI = process.env.zoom_redirectUri;
    const { clientID, clientSecret, redirectURI } = req.body;
    console.log({ clientID, clientSecret, redirectURI });

    // Step 1: Exchange authorization code for access token
    const authCode = req.body.authCode;
    const manageClass = req.body.manageClass;

    const tokenResponse = await axios.post(
      "https://zoom.us/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code: authCode,
          redirect_uri: redirectURI,
        },
        auth: {
          username: clientID,
          password: clientSecret,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // Step 2: Use access token to create a meeting
    const meetingResponse = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      manageClass,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.send({
      tokenResponse: tokenResponse.data,
      meeting: meetingResponse.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

module.exports.getARecording = async (req, res, next) => {
  try {
    const clientID = process.env.zoom_clientId;
    const clientSecret = process.env.zoom_clientSecret;
    const redirectURI = process.env.zoom_redirectUri2; // The same as used in your frontend
    // Step 1: Exchange authorization code for access token
    const authCode = req.body.authCode;
    const id = req.params.meetingId;

    const tokenResponse = await axios.post(
      "https://zoom.us/oauth/token",
      null,
      {
        params: {
          grant_type: "authorization_code",
          code: authCode,
          redirect_uri: redirectURI,
        },
        auth: {
          username: clientID,
          password: clientSecret,
        },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    const meetingId = +id;

    // Step 2: Use access token to create a meeting
    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    res.send({
      meeting: response.data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

module.exports.getAllClassesByMentorEmail = async (req, res) => {
  try {
    const executionMEmail = req.params.email;
    const results = await classCollection
      .find({ "mentors.mentorEmail": executionMEmail })
      .toArray();

    res.send(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};

module.exports.updateClassParticipants = async (req, res) => {
  try {
    const classId = req.params.classId; // Get class _id from request parameters
    const newParticipant = req.body; // Get new participant data from the request body

    const result = await classCollection.updateOne(
      { _id: ObjectId(classId) },
      { $push: { participants: { participant: newParticipant } } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json({ message: "Participant added successfully", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};
module.exports.deleteClassParticipant = async (req, res) => {
  try {
    const classId = req.params.classId; // Get class _id from request parameters
    const participantId = req.body.participantId; // Get participantId from the request body

    const result = await classCollection.updateOne(
      { _id: ObjectId(classId) },
      { $pull: { participants: { 'participant.participantId': participantId } } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json({ message: "Participant removed successfully", result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred" });
  }
};
