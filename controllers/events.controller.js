const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const eventCollection = client.db("experiment-labs").collection("events");
const eventRequestCollection = client.db("experiment-labs").collection("eventRequests");
const orgCollection = client.db('experiment-labs').collection('organizations');
const axios = require('axios');
const qs = require('querystring');

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
}


module.exports.fetchEventRequest = async (req, res, next) => {
  try {
    const organizationId = req.params.organizationId;
    const result = await eventRequestCollection.find(organizationId).toArray();
    res.send(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}


module.exports.createZoomMeeting = async (req, res, next) => {

  try {
    const organizationId = req.params.organizationId;
    const { start_time, duration } = req.body;
    const orgData = await orgCollection.findOne({ _id: new ObjectId(organizationId) });
    const scheduleZoomCredentials = orgData?.scheduleZoomCredentials;
    const { accountId, clientId, clientSecret } = scheduleZoomCredentials;

    const request = await axios.post(
      "https://zoom.us/oauth/token",
      qs.stringify({ grant_type: 'account_credentials', account_id: accountId }),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        }
      }
    );

    const accessToken = request.data.access_token;

    const body = {
      topic: "Doubt Clearing Session",
      type: 2,
      waiting_room: true,
      timezone: "Asia/Kolkata",
      start_time: start_time,
      duration: duration
    };

    const meetingResponse = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      body,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    res.send(meetingResponse?.data);


  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }

}


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
    const orgData = await orgCollection.findOne({ _id: new ObjectId(organizationId) });
    const scheduleZoomCredentials = orgData?.scheduleZoomCredentials;
    const { accountId, clientId, clientSecret } = scheduleZoomCredentials;

    const request = await axios.post(
      "https://zoom.us/oauth/token",
      qs.stringify({ grant_type: 'account_credentials', account_id: accountId }),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        }
      }
    );

    const accessToken = request.data.access_token;

    const recodingResponse = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}/recordings`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    res.send(recodingResponse.data);


  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error", error });
  }

}


module.exports.updateAccountSettings = async (req, res, next) => {

  try {
    const organizationId = req.params.organizationId;
    const data = req.body;
    const orgData = await orgCollection.findOne({ _id: new ObjectId(organizationId) });
    const scheduleZoomCredentials = orgData?.scheduleZoomCredentials;
    const { accountId, clientId, clientSecret } = scheduleZoomCredentials;

    const request = await axios.post(
      "https://zoom.us/oauth/token",
      qs.stringify({ grant_type: 'account_credentials', account_id: accountId }),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        }
      }
    );

    const accessToken = request.data.access_token;

    const settingResponse = await axios.patch(
      `https://api.zoom.us/v2/accounts/me/settings?option=recording_authentication`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      }
    );

    // res.send({accessToken: request.data});
    res.send(settingResponse?.data);


  } catch (error) {
    console.error("Error:", error.response);
    res.send({ message: "Internal server error", error: error });
  }

}


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
}