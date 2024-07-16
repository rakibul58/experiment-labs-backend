const admin = require("firebase-admin");

const firebaseGenerateToken = async (email) => {
  try {
    const userRecord = await admin.auth().createCustomToken(email);
    return userRecord;
  } catch (error) {
    return error;
  }
};

module.exports = {
  firebaseGenerateToken,
};
