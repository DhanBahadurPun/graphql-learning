const { AuthenticationError } = require("apollo-server-core");
const jwt = require("jsonwebtoken");
const UserModel = require("../modules/users/user.model");

module.exports = async ({ req }) => {
  let token;

  if (req.headers["x-access-token"]) {
    token = req.headers["x-access-token"];
  }

  if (req.headers["authorization"]) {
    token = req.headers["authorization"];
  }

  if (req.query.token) {
    token = req.query.token;
  }

  if (token) {
    const jwt_payload = jwt.verify(token, process.env.SecretKey);
    if (jwt_payload) {
      const user = await UserModel.findOne({ _id: jwt_payload.id });
      if (user) {
        return user;
      } else {
        throw new AuthenticationError("You must be logged in to access!");
      }
    } else {
      throw new Error("Invalid token");
    }
  } else {
    throw new Error("Token not provided");
  }
};
