const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const classCollection = client.db("experiment-labs").collection("classes");
const orgCollection = client.db("experiment-labs").collection("organizations");
const chapterCollection = client.db("experiment-labs").collection("chapters");
const courseCollection = client.db("experiment-labs").collection("courses");
const axios = require("axios");
const qs = require("querystring");

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
    res.status(500).json({
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

module.exports.createAClass = async (req, res, next) => {
  try {
    const { classData } = req.body;
    const { organizationId, classInfo } = classData;
    const {
      courseStartingDateTime,
      duration,
      meetingData,
      chapterId,
      taskType,
      taskName,
      batches,
      courseId,
      taskDrip,
    } = classInfo;
    const { topic, join_url } = meetingData;

    // creating zoom meeting if join_url not send
    if (!join_url) {
      const orgData = await orgCollection.findOne({
        _id: new ObjectId(organizationId),
      });
      const { scheduleZoomCredentials } = orgData;
      const { accountId, clientId, clientSecret } = scheduleZoomCredentials;

      const oauthResponse = await axios.post(
        "https://zoom.us/oauth/token",
        qs.stringify({
          grant_type: "account_credentials",
          account_id: accountId,
        }),
        {
          headers: {
            Authorization: `Basic ${Buffer.from(
              `${clientId}:${clientSecret}`
            ).toString("base64")}`,
          },
        }
      );

      const { access_token } = oauthResponse.data;

      const zoomBody = {
        topic,
        type: 2,
        waiting_room: true,
        timezone: "Asia/Kolkata",
        start_time: courseStartingDateTime + ":00",
        duration: duration,
      };

      const meetingResponse = await axios.post(
        "https://api.zoom.us/v2/users/me/meetings",
        zoomBody,
        {
          headers: {
            Authorization: `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        }
      );

      classInfo.meetingData = meetingResponse.data;
    }

    classResult = await classCollection.insertOne(classInfo);

    const filter = { _id: new ObjectId(chapterId) };
    const options = { upsert: true };

    const newTask = {
      taskId: "" + classResult?.insertedId,
      taskType,
      taskName,
      batches,
      contentStage: "",
      taskDrip,
    };

    const updatedDoc = {
      $push: {
        tasks: newTask,
      },
    };

    const chapterResult = await chapterCollection.updateOne(
      filter,
      updatedDoc,
      options
    );

    if (chapterResult.modifiedCount > 0) {
      const filter = { _id: new ObjectId(courseId) };
      const options = { upsert: true };

      const updateCourse = {
        $inc: { totalTask: 1 }, // Increment totalTask by 1
      };

      const courseResult = await courseCollection.updateOne(
        filter,
        updateCourse,
        options
      );

      // Check if the update was successful, and if totalTask field didn't exist, it will be created
      if (courseResult.modifiedCount > 0 || courseResult.upsertedCount > 0) {
        res.status(200).json({
          success: true,
          message: "Class added successfully!",
          data: { classResult, courseResult, chapterResult },
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Failed to update course!",
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to update chapter!",
        error,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};
