const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const userCollection = client.db("experiment-labs").collection("users");
const receiptCollection = client.db("experiment-labs").collection("receipts");
const courseCollection = client.db("experiment-labs").collection("courses");
const organizationCollection = client.db("experiment-labs").collection("organizations");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const firebaseUtils = require("../utils/firebaseSignUp");
const passwordUtils = require("../utils/generatePassword");

module.exports.getAnUserByEmail = async (req, res, next) => {
  try {
    const email = req.query.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
    if (!user) return res.send({ isUser: false });
    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports.saveAUser = async (req, res, next) => {
  const user = req.body;

  const email = await userCollection.findOne({ email: user.email });

  if (email) {
    return res.status(400).json({ message: "This user already exists" });
  }
  const result = await userCollection.insertOne(user);
  res.send(result);
};

module.exports.getAllMentors = async (req, res, next) => {
  const organizationId = req.params.organizationId;
  const rolesToMatch = ["execution mentor", "expert mentor"];
  const result = await userCollection
    .find({
      $and: [
        { organizationId: organizationId },
        { role: { $in: rolesToMatch } },
      ],
    })
    .toArray();

  res.send(result);
};



module.exports.checkoutPayment = async (req, res, next) => {
  const { price, paymentInstance } = req.body;
  const instance = new Razorpay(paymentInstance);
  const options = {
    amount: Number(price * 100),
    currency: "INR",
  };
  const order = await instance.orders.create(options);
  res.status(200).json({
    success: true,
    order,
  });
};


module.exports.verifyPayment = async (req, res, next) => {
  // console.log("Entered");
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    razorpay_key_secret,
    batchId,
    coupon,
    couponId,
    courseId,
    discountAmount,
    email,
    organizationId,
    organizationName,
    originalPrice,
    paidAmount,
    userId,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", razorpay_key_secret)
    .update(body.toString())
    .digest("hex");
  {
    razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_key_secret;
  }

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    const newReceipt = {
      batchId,
      coupon,
      couponId,
      courseId,
      discountAmount,
      UserEmail: email,
      organizationId,
      organizationName,
      originalPrice,
      paidAmount,
      userId,
      razorpay_payment_id,
      razorpay_order_id,
      paidAt: new Date(),
    };

    const result = await receiptCollection.insertOne(newReceipt);

    const receiptId = result.insertedId;

    // const updateResult = await userCollection.updateOne(
    //   { email: email }, // Find the document by its email
    //   {
    //     $push: {
    //       courses: {
    //         courseId,
    //         batchId,
    //         enrollDate: new Date(),
    //         paidAmount,
    //         receiptId
    //       }
    //     }
    //   } // Push the newObject into the array
    // );
    const updateResult = await userCollection.updateOne(
      { email: email, "courses.courseId": courseId }, // Find the document by its email and check if courseId is present
      {
        $set: {
          "courses.$.batchId": batchId,
          "courses.$.enrollDate": new Date(),
          "courses.$.paidAmount": paidAmount,
          "courses.$.receiptId": receiptId,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      // The courseId doesn't exist, push a new object
      await userCollection.updateOne(
        { email: email },
        {
          $push: {
            courses: {
              courseId,
              batchId,
              enrollDate: new Date(),
              paidAmount,
              receiptId,
            },
          },
        }
      );
    }

    const userData = await userCollection.findOne({ email: email });

    res.send({
      success: true,
      result,
      updateResult,
      userData
    });
  } else {
    res.json({
      success: false,
    });
  }
};

module.exports.addStudent = async (req, res) => {
  const user = req.body;

  try {
    // Generate a custom password
    const password = passwordUtils.generateCustomPassword(user);
    user.password = password;

    const result = await firebaseUtils.createUserWithEmailAndPassword(
      user.email,
      password
    );

    if (!result.success) {
      console.error(
        `Failed to create user in Firebase for email: ${user.email}`
      );
    } else {
      const insertedUser = await userCollection.insertOne(user);

      res.status(200).json({
        message: "User added to MongoDB and Firebase successfully",
        insertedUser,
      });
    }
  } catch (error) {
    console.error("Error adding users:", error);
    res
      .status(500)
      .json({ message: "Error adding users", error: error.message });
  }
};

module.exports.addBulkStudent = async (req, res) => {
  const { users, relatedData } = req.body;
  const insertedUsersData = []; // Array to store inserted user data
  console.log(req.body);

  try {
    // Add users to Firebase using the function
    for (const user of users) {
      // Merge each item of relatedData into the user object
      Object.assign(user, relatedData);

      // Generate a custom password
      const password = passwordUtils.generateCustomPassword(user);
      user.password = password;

      const result = await firebaseUtils.createUserWithEmailAndPassword(
        user.email,
        password
      );

      if (!result.success) {
        console.error(
          `Failed to create user in Firebase for email: ${user.email}`
        );
        // Handle error case: Maybe remove the user from MongoDB?
      } else {
        // Insert the user into MongoDB and store the data in the array
        const insertedUser = await userCollection.insertOne(user);
        insertedUsersData.push(user);
      }
    }

    const count = await userCollection.countDocuments();

    res.status(200).json({
      message: "Users added to MongoDB and Firebase successfully",
      insertedUsers: insertedUsersData,
      count,
    });
  } catch (error) {
    console.error("Error adding users:", error);
    res
      .status(500)
      .json({ message: "Error adding users", error: error.message });
  }
};

module.exports.updateUsersInCourseBatch = async (req, res) => {
  try {
    const { userEmails, courseId, batchId } = req.body;

    // Ensure the provided courseId and batchId are valid ObjectId
    const validCourseId = ObjectId.isValid(courseId);
    const validBatchId = ObjectId.isValid(batchId);

    if (!validCourseId || !validBatchId) {
      return res.status(400).json({ message: "Invalid courseId or batchId" });
    }

    // Update users in MongoDB based on email, courseId, and batchId
    const updatedUsers = await userCollection.updateMany(
      {
        email: { $in: userEmails },
        "courses.courseId": { $ne: courseId },
        "courses.batchId": { $ne: batchId },
      },
      {
        $addToSet: {
          courses: {
            courseId,
            batchId,
            // Add more fields to add to the courses array as needed
          },
        },
      }
    );

    res
      .status(200)
      .json({ message: "Users updated successfully", updatedUsers });
  } catch (error) {
    console.error("Error updating users:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};


module.exports.getStudentsByOrganization = async (req, res) => {
  try {
    const { organizationId } = req.params;

    // Ensure the provided organizationId is a valid ObjectId
    const validOrganizationId = ObjectId.isValid(organizationId);

    if (!validOrganizationId) {
      return res.status(400).json({ message: "Invalid organizationId" });
    }

    // Find all students under the given organization
    const students = await userCollection
      .find({
        organizationId,
        role: "user",
      })
      .toArray();

    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

module.exports.addDeviceToUser = async (req, res) => {
  try {
    const { userEmail } = req.params;
    const { device } = req.body;

    // Find the user with the specified userEmail
    const user = await userCollection.findOne({ email: userEmail });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch organization data using the organizationId from the user
    const organization = await organizationCollection.findOne({
      _id: new ObjectId(user.organizationId),
    });

    // Check if the organization exists
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check the number of devices in the user's array
    if (!user.devices) {
      user.devices = [];
    }

    // Check if the user already has reached the maximum allowed devices
    if (user.devices.length >= organization.maxDeviceCount) {
      return res
        .status(400)
        .json({ message: "User has reached the maximum allowed devices" });
    }

    // Add the new device to the user's array
    user.devices.push(device);

    // Update the user in the collection
    const updateResult = await userCollection.updateOne(
      { email: userEmail },
      { $set: { devices: user.devices } }
    );

    // Check if the update was successful
    if (updateResult.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "Device added successfully", user });
    } else {
      return res.status(500).json({ message: "Failed to update user" });
    }
  } catch (error) {
    console.error("Error adding device to user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.removeDeviceFromUser = async (req, res) => {
  try {
    const { userEmail } = req.params; // Extract the userEmail from the request parameters
    const { device } = req.body; // Extract the deviceId from the request body

    // Find the user with the specified userEmail
    const user = await userCollection.findOne({ email: userEmail });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has devices
    if (!user.devices || user.devices.length === 0) {
      return res
        .status(400)
        .json({ message: "User does not have any devices" });
    }

    // Find the index of the device in the user's array
    const deviceIndex = user.devices.findIndex((item) => item === device);

    // Check if the device is not found
    if (deviceIndex === -1) {
      return res.status(404).json({ message: "Device not found for the user" });
    }

    // Remove the device from the user's array
    user.devices.splice(deviceIndex, 1);

    // Update the user in the collection
    const updateResult = await userCollection.updateOne(
      { email: userEmail },
      { $set: { devices: user.devices } }
    );

    // Check if the update was successful
    if (updateResult.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "Device removed successfully", user });
    } else {
      return res.status(500).json({ message: "Failed to update user" });
    }
  } catch (error) {
    console.error("Error removing device from user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports.updateUserData = async (req, res) => {
  try {
    const { userEmail } = req.params; // Extract the userEmail from the request parameters
    const updatedData = req.body; // Extract the updated data from the request body

    // Find the user with the specified userEmail
    const user = await userCollection.findOne({ email: userEmail });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Compare and update the user data
    for (const key in updatedData) {
      if (Object.hasOwnProperty.call(updatedData, key)) {
        // Check if the field exists in the user data
        if (user[key] !== undefined) {
          // Update the field if it has changed
          if (user[key] !== updatedData[key]) {
            user[key] = updatedData[key];
          }
        } else {
          // Add the field if it doesn't exist in the user data
          user[key] = updatedData[key];
        }
      }
    }

    // Update the user in the collection
    const updateResult = await userCollection.updateOne(
      { email: userEmail },
      { $set: user }
    );

    // Check if the update was successful
    if (updateResult.modifiedCount > 0) {
      return res
        .status(200)
        .json({ message: "User data updated successfully", user });
    } else {
      return res.status(500).json({ message: "Failed to update user data" });
    }
  } catch (error) {
    console.error("Error updating user data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
