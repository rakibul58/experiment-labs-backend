const admin = require("firebase-admin");

const serviceAccount = {
  type: process.env.type,
  project_id: process.env.project_id,
  private_key_id: process.env.private_key_id,
  private_key: process.env.private_key.replace(/\\n/g, "\n"),
  client_email: process.env.client_email,
  client_id: process.env.client_id,
  auth_uri: process.env.auth_uri,
  token_uri: process.env.token_uri,
  auth_provider_x509_cert_url: process.env.auth_provider_x509_cert_url,
  client_x509_cert_url: process.env.client_x509_cert_url,
  universe_domain: process.env.universe_domain,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  // Other optional configurations
});

const createUserWithEmailAndPassword = async (email, password) => {
  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      // Other user properties if needed
    });
    console.log("Successfully created new user:", userRecord.uid);
    return { success: true, uid: userRecord.uid };
  } catch (error) {
    console.error("Error creating new user:", error);
    return { success: false, error: error };
  }
};

module.exports = {
  createUserWithEmailAndPassword,
};
