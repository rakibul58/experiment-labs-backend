const jwt = require("jsonwebtoken");

const createToken = (payload) => {
  try {
    const token = jwt.sign(payload, process.env.stride_token_secret, {
      expiresIn: process.env.jwt_access_expires_in,
    });
    return token
  } catch (error) {
    console.log({ error });
  }
};

module.exports = {
  createToken,
};
