const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const eventCollection = client.db("experiment-labs").collection("events");
const eventRequestCollection = client
  .db("experiment-labs")
  .collection("eventRequests");
const orgCollection = client.db("experiment-labs").collection("organizations");
const userCollection = client.db("experiment-labs").collection("users");
const axios = require("axios");
const qs = require("querystring");
const scheduleCollection = client.db("experiment-labs").collection("schedule");

module.exports.addAnEvent = async (req, res, next) => {
  const event = req.body;
  const result = await eventCollection.insertOne(event);
  res.send(result);
};

module.exports.getAllEvent = async (req, res, next) => {
  const result = await eventCollection.find({}).toArray();
  res.send(result);
};

module.exports.getAnEvent = async (req, res, next) => {
  const id = req.params.id;
  const filter = { _id: new ObjectId(id) };
  const result = await eventCollection.findOne(filter);
  res.send(result);
};

module.exports.getEventsByEmail = async (req, res, next) => {
  try {
    const email = req.params.email;
    const filter = { requester: email };
    const result = await eventCollection.find(filter).toArray();
    //   res.send(result);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.eventRequest = async (req, res, next) => {
  try {
    const data = req.body;
    const result = await eventRequestCollection.insertOne(data);
    res.send(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.fetchEventRequest = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    const result = await eventRequestCollection.find(organizationId).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.createZoomMeeting = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    const { start_time, duration, studentName, courseName } = req.body;
    const orgData = await orgCollection.findOne({
      _id: new ObjectId(organizationId),
    });
    const scheduleZoomCredentials = orgData?.scheduleZoomCredentials;
    const { accountId, clientId, clientSecret } = scheduleZoomCredentials;

    const request = await axios.post(
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

    const accessToken = request.data.access_token;

    const body = {
      topic: `Session with ${studentName} on ${courseName}`,
      type: 2,
      waiting_room: true,
      timezone: "Asia/Kolkata",
      start_time: start_time,
      duration: duration,
      settings: {
        join_before_host: true, // Allow participants to join before the host
        waiting_room: false // Disable waiting room if you want the meeting to start without any manual intervention
      }
    };

    const meetingResponse = await axios.post(
      "https://api.zoom.us/v2/users/me/meetings",
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.send(meetingResponse?.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};


module.exports.deleteZoomMeeting = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    const meetingId = req.params.meetingId;
    const orgData = await orgCollection.findOne({
      _id: new ObjectId(organizationId),
    });
    const scheduleZoomCredentials = orgData?.scheduleZoomCredentials;
    const { accountId, clientId, clientSecret } = scheduleZoomCredentials;

    const request = await axios.post(
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

    const accessToken = request.data.access_token;
    const meetingResponse = await axios.delete(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    // console.log("meeting response ",meetingResponse);
    // console.log("meeting response ",meetingResponse?.status);
    if (meetingResponse?.status == 204) {
      console.log("inside if")
      res.status(200).json({success: true, message: "Meeting successfully deleted" });
    } else {
      res.status(400).json({success: false, message: "Failed to delete meeting" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

// module.exports.updateZoomMeeting = async (req, res, next) => {

//   try {
//     const organizationId = req.params.organizationId;
//     const { start_time, duration, meetingId } = req.body;
//     const orgData = await orgCollection.findOne({ _id: new ObjectId(organizationId) });
//     const scheduleZoomCredentials = orgData?.scheduleZoomCredentials;
//     const { accountId, clientId, clientSecret } = scheduleZoomCredentials;

//     const request = await axios.post(
//       "https://zoom.us/oauth/token",
//       qs.stringify({ grant_type: 'account_credentials', account_id: accountId }),
//       {
//         headers: {
//           'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
//         }
//       }
//     );

//     const accessToken = request.data.access_token;

//     const body = {
//       start_time: start_time,
//       duration: duration,
//       recurrence: {}
//     };

//     const meetingResponse = await axios.patch(
//       `https://api.zoom.us/meetings/${meetingId}`,
//       body,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//           'Content-Type': 'application/json'
//         },
//       }
//     );

//     res.send(meetingResponse);

//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({ message: "Internal server error", error });
//   }

// }

module.exports.fetchRecording = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    const { meetingId } = req.body;
    const orgData = await orgCollection.findOne({
      _id: new ObjectId(organizationId),
    });
    const scheduleZoomCredentials = orgData?.scheduleZoomCredentials;
    const { accountId, clientId, clientSecret } = scheduleZoomCredentials;

    const request = await axios.post(
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

    const accessToken = request.data.access_token;

    const recodingResponse = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.send(recodingResponse.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

module.exports.updateAccountSettings = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    const data = req.body;
    const orgData = await orgCollection.findOne({
      _id: new ObjectId(organizationId),
    });
    const scheduleZoomCredentials = orgData?.scheduleZoomCredentials;
    const { accountId, clientId, clientSecret } = scheduleZoomCredentials;

    const request = await axios.post(
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

    const accessToken = request.data.access_token;

    const settingResponse = await axios.patch(
      `https://api.zoom.us/v2/accounts/me/settings?option=recording_authentication`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    // res.send({accessToken: request.data});
    res.send(settingResponse?.data);
  } catch (error) {
    console.error("Error:", error.response);
    res.send({ message: "Internal server error", error: error });
  }
};

module.exports.updateAnEvent = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const filter = { _id: new ObjectId(id) };
    const updateDoc = { $set: updateData };
    const result = await eventCollection.updateOne(filter, updateDoc);

    res.send(result);
  } catch (error) {
    console.error("Error:", error.response);
    res.send({ message: "Internal server error", error: error });
  }
};

module.exports.getSchedulesOfMentorsStudents = async (req, res, next) => {
  try {
    const { mentorId } = req.params;

    const result = await scheduleCollection
      .find({
        "executionMentors.mentorId": mentorId,
      })
      .toArray();

    res.status(200).json({
      success: true,
      message: "Schedules Found Successfully!",
      data: result,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};

module.exports.assignMentorToEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { executionMentors } = req.body;

    // Validate that mentor data is provided
    if (!executionMentors || executionMentors?.length < 1) {
      console.log(executionMentors);
      return res
        .status(400)
        .json({ message: "Mentor data should be provided" });
    }

    // Update the submission document with the mentor data
    const updateResult = await eventCollection.updateOne(
      { _id: new ObjectId(eventId) },
      { $set: { executionMentors: executionMentors } }
    );

    if (updateResult.modifiedCount === 1) {
      res.status(200).json({ message: "Mentor assigned successfully" });
    } else {
      res
        .status(404)
        .json({ message: "Learner not found or mentor not assigned" });
    }
  } catch (error) {
    console.error("Error assigning mentor to learner:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.getEventsByExecutionMentorEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }

    // Find events where the execution mentor is included in the executionMentors array
    const events = await eventCollection
      .find({
        "executionMentors.mentorEmail": email,
      })
      .toArray();

    if (events.length === 0) {
      return res
        .status(404)
        .json({ message: "No events found for the given mentor email" });
    }

    res.status(200).json(events);
  } catch (error) {
    console.error("Error fetching events by execution mentor email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
