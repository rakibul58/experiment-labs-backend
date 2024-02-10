const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const notificationCollection = client
  .db("experiment-labs")
  .collection("notifications");
const userCollection = client.db("experiment-labs").collection("users");
const { getIo } = require("../socketSetup");

module.exports.getAllNotifications = async (req, res) => {
  const notifications = await notificationCollection.find().toArray();
  res.json(notifications);
};

module.exports.addNotification = async (req, res) => {
  const notification = req.body;

  const result = await notificationCollection.insertOne(notification);

  // Send the new notification to all connected clients
  getIo().emit("notification", notification);

  res.json(result);
};

module.exports.getUserNotifications = async (req, res) => {
  try {
    const { userEmail } = req.params; // Extract the userEmail from the request parameters

    // Find the user with the specified userEmail
    const user = await userCollection.findOne({ email: userEmail });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let notifications = [];

    // Fetch notifications based on recipient type
    if (user.role === "user") {
      notifications = await getStudentNotifications(user);
    } else if (user.role === "admin") {
      notifications = await getAdminNotifications(user);
    }
    // Add more conditions for other recipient types as needed

    res.status(200).json({ notifications });
  } catch (error) {
    console.error("Error fetching user notifications:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Helper function to get notifications for 'Students' type
// const getStudentNotifications = async (user) => {
//   return notificationCollection
//     .find({
//       "recipient.organizationId": user.organizationId,
//       $or: [
//         {
//           "recipient.type": "Students",
//           "recipient.courseId": {
//             $in: user.courses.map((course) => course.courseId),
//           },
//           "recipient.batches": {
//             $in: user.courses.map((course) => course.batchId),
//           },
//         },
//         {
//           "recipient.type": "Specific Student",
//           "recipient.recipientEmail": user.email,
//         },
//       ],
//     })
//     .toArray();
// };

const getStudentNotifications = async (user) => {
  return notificationCollection
    .find({
      "recipient.organizationId": user.organizationId,
      $or: [
        {
          "recipient.type": "Students",
          "recipient.courseId": {
            $in: user.courses.map((course) => course.courseId),
          },
          "recipient.batches": {
            $elemMatch: {
              batchId: { $in: user.courses.map((course) => course.batchId) },
            },
          },
        },
        {
          "recipient.type": "Specific Student",
          "recipient.recipientEmail": user.email,
        },
      ],
    })
    .toArray();
};

// Helper function to get notifications for 'Admin' type
const getAdminNotifications = async (user) => {
  return notificationCollection
    .find({
      "recipient.organizationId": user.organizationId,
      $or: [
        {
          "recipient.type": "Admins",
        },
        {
          "recipient.type": "Specific Admin",
          "recipient.recipientEmail": user.email,
        },
      ],
    })
    .toArray();
};
