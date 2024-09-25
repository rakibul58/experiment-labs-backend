const client = require("../utils/dbConnect");
const userCollection = client.db("experiment-labs").collection("users");
const firebaseUtils = require("../utils/firebaseSignUp");
const jwt = require("jsonwebtoken");
const { createToken } = require("../utils/createToken");
const { firebaseGetUser } = require("../utils/firebaseGetUser");
const { generateCustomPassword } = require("../utils/generatePassword");

module.exports.createUser = async (req, res, next) => {
  try {
    const { token, requestedBy } = req.body;
    let secret = "";

    switch (requestedBy) {
      case "strideahead":
        secret = process.env.stride_token_secret;
        break;
      case "mergedDashboard":
        secret = process.env.merged_dashboard_token_secret;
        break;
      default:
        break;
    }

    const decoded = jwt.verify(token, secret);

    const { email } = decoded;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide an email!",
      });
    }

    const isUserExists = await userCollection.findOne({ email });

    if (isUserExists) {
      const user = await firebaseGetUser(email);
      if (user.uid) {
        return res.status(200).json({
          user,
          credentials: isUserExists,
          success: true,
          message: "Login Credentials Retrieved!",
        });
      }
    }

    const { iat, exp, ...user } = decoded;

    if (!user.name || !user.phone) {
      return res.status(400).json({
        success: false,
        message: "Please provide name and phone!",
      });
    }

    user.password = generateCustomPassword(user);

    const firebaseResponse = await firebaseUtils.createUserWithEmailAndPassword(
      user.email,
      user.password
    );

    if (decoded.role === "user") {
      user.dateCreated = new Date();
    }

    if (!firebaseResponse.success) {
      return res.status(403).json({
        success: false,
        message: "User can not be registered!",
      });
    } else {
      const insertResponse = await userCollection.insertOne(user);

      return res.status(201).json({
        credentials: user,
        success: true,
        message: "User Registered successfully!",
        data: insertResponse,
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Something went wrong!",
      error,
    });
  }
};

module.exports.createTestToken = async (req, res, next) => {
  const result = createToken(req.body);
  res.send({
    token: result,
  });
};

module.exports.decodeToken = async (req, res, next) => {
  const decoded = jwt.verify(req.body.token, process.env.stride_token_secret);
  res.send({
    decoded,
  });
};
