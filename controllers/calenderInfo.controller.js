const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");

const calenderInfoCollection = client
  .db("experiment-labs")
  .collection("calenderInfo");

// post /api/v1/calenderInfo
module.exports.syncCalendarToDB = async (req, res) => {
  try {
    const { calendarInfo } = req.body;
    const { email } = calendarInfo;

    // Check if the email already exists
    const existingData = await calenderInfoCollection.findOne({
      email,
    });

    if (existingData) {
      // Update the existing document
      const result = await calenderInfoCollection.updateOne(
        { email },
        { $set: calendarInfo }
      );
      return res.status(200).json({
        success: true,
        message: "Calendar info updated successfully!",
        data: result,
      });
    } else {
      // Insert a new document
      const result = await calenderInfoCollection.insertOne(calendarInfo);
      return res.status(200).json({
        success: true,
        message: "Calendar info created successfully!",
        data: result,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};

// // put /api/v1/calenderInfo/events
// module.exports.updateEvents = async (req, res) => {
//   try {
//     const { calendarInfo } = req.body;
//     const { email, event } = calendarInfo;
//     const { requester, start_time, taskId } = event;

//     // Check if the email already exists
//     const existingData = await calenderInfoCollection.findOne({
//       email,
//     });

//     if (!existingData) {
//       return res.status(404).json({
//         success: false,
//         message: "Calendar info not found!",
//       });
//     }

//     const isSlotUnavailable = await calenderInfoCollection.findOne({
//       email,
//       "events.start_time": start_time,
//       "events.taskId": taskId,
//     });

//     if (isSlotUnavailable) {
//       return res.status(404).json({
//         success: false,
//         message: "Requested slot has been booked!",
//       });
//     }

//     const isRequesterAvailable = await calenderInfoCollection.findOne({
//       email,
//       "events.requester": requester,
//       "events.taskId": taskId,
//     });

//     if (isRequesterAvailable) {
//       // Update the existing document
//       const result = await calenderInfoCollection.updateOne(
//         { email, "events.requester": requester, "events.taskId": taskId },
//         { $set: { "events.$": event } }
//       );
//       //  console.log("Data updated successfully for email:", email);
//       res.status(200).json({
//         success: true,
//         message: "Events updated successfully!",
//         data: result,
//       });
//     } else {
//       // Insert a new document
//       const result = await calenderInfoCollection.updateOne(
//         { email },
//         { $push: { events: event } }
//       );
//       // console.log("New data inserted for email:", email);
//       return res.status(200).json({
//         success: true,
//         message: "Events added successfully!",
//         data: result,
//       });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error,
//     });
//   }
// };


// module.exports.updateEvents = async (req, res) => {
//   try {
//     const { calendarInfo } = req.body;
//     const { email, event } = calendarInfo;
//     const { requester, scheduleId } = event;

//     // Check if the email already exists
//     const existingData = await calenderInfoCollection.findOne({
//       email,
//     });

//     if (!existingData) {
//       return res.status(404).json({
//         success: false,
//         message: "Calendar info not found!",
//       });
//     }

//     const isRequesterAvailable = await calenderInfoCollection.findOne({
//       email,
//       "events.requester": requester,
//       "events.scheduleId": scheduleId,
//     });

//     console.log({isRequesterAvailable});

//     if (isRequesterAvailable) {
//       // Update the existing document
//       const result = await calenderInfoCollection.updateOne(
//         {
//           email, // Ensures you're matching the document with the correct email
//           "events.requester": requester, // Matches the requester in the events array
//           "events.scheduleId": scheduleId // Matches the scheduleId in the events array
//         },
//         { $set: { "events.$[elem]": event } }, // Use the array filter to specify which element to update
//         { arrayFilters: [{ "elem.requester": requester, "elem.scheduleId": scheduleId }] } // Define the filters for matching the correct event
//       );
//       //  console.log("Data updated successfully for email:", email);
//       res.status(200).json({
//         success: true,
//         message: "Events updated successfully!",
//         data: result,
//       });
//     } else {
//       // Insert a new document
//       const result = await calenderInfoCollection.updateOne(
//         { email },
//         { $push: { events: event } }
//       );
//       // console.log("New data inserted for email:", email);
//       return res.status(200).json({
//         success: true,
//         message: "Events added successfully!",
//         data: result,
//       });
//     }
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error,
//     });
//   }
// };

module.exports.updateEvents = async (req, res) => {
  try {
    const { calendarInfo } = req.body;
    const { email, event } = calendarInfo;
    const { requester, scheduleId } = event;

    // Check if the document with the email already exists
    const existingData = await calenderInfoCollection.findOne({
      email,
    });

    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "Calendar info not found!",
      });
    }

    // Check if the event with the given requester and scheduleId exists in the events array
    const eventExists = existingData.events.find(
      (e) => e.requester === requester && e.scheduleId === scheduleId
    );

    if (eventExists) {
      // Update the existing event in the array
      const result = await calenderInfoCollection.updateOne(
        {
          email, // Ensures you're matching the document with the correct email
          "events.requester": requester, // Matches the requester in the events array
          "events.scheduleId": scheduleId // Matches the scheduleId in the events array
        },
        { $set: { "events.$[elem]": event } }, // Use the array filter to specify which element to update
        { arrayFilters: [{ "elem.requester": requester, "elem.scheduleId": scheduleId }] } // Define the filters for matching the correct event
      );

      return res.status(200).json({
        success: true,
        message: "Event updated successfully!",
        data: result,
      });
    } else {
      // If the event doesn't exist, push the new event into the events array
      const result = await calenderInfoCollection.updateOne(
        { email }, // Find the document by email
        { $push: { events: event } } // Push the new event to the events array
      );

      return res.status(200).json({
        success: true,
        message: "Event added successfully!",
        data: result,
      });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};



// /api/v1/calenderInfo/email/:email
module.exports.getCalendarInfoByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Retrieve data based on email
    const calendarInfo = await calenderInfoCollection.findOne({ email });

    // Check if data is found
    if (!calendarInfo) {
      return res.status(404).json({
        success: false,
        message: "Calendar info not found!",
      });
    }

    // Return the retrieved data
    res.status(200).json({
      success: true,
      message: "Calendar Info fetched Successfully!",
      data: calendarInfo,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error,
    });
  }
};
