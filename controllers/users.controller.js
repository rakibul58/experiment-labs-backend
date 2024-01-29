const { ObjectId } = require("mongodb");
const client = require("../utils/dbConnect");
const userCollection = client.db("experiment-labs").collection("users");
const courseCollection = client.db("experiment-labs").collection("courses");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const firebaseUtils = require("../utils/firebaseSignUp");
const passwordUtils = require("../utils/generatePassword");

module.exports.getAnUserByEmail = async (req, res, next) => {
  try {
    const email = req.query.email;
    const query = { email: email };
    const user = await userCollection.findOne(query);
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
    return res.status(400).json({ message: "sorry a user already exists" });
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
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", razorpay_key_secret)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    res.redirect("http://localhost:3000/courseAccess");
  } else {
    res.status(400).json({
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
