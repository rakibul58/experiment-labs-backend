const admin = require("firebase-admin");

const firebaseGetUser = async (email) => {
  try {
    const user = await admin.auth().getUserByEmail(email);
    return user;
  } catch (error) {
    return error;
  }
};

module.exports = {
  firebaseGetUser,
};
