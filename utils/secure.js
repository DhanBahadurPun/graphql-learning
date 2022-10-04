const jwt = require("jsonwebtoken");
const UserModel = require("../modules/users/user.model");

//This processes token from header x-access-token
const SecureAPI = () => {
  return function(req, res, next) {
    //TODO need to verify permissions
    let token =
      req.cookies.access_token ||
      req.body.access_token ||
      req.query.access_token ||
      req.headers["access_token"];
    if (!token) {
      return next({
        message: "Token not provided."
      });
    }

    jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
      if (err) {
        return next({
          message: "Invalid token."
        });
      } else {
        if (decoded) {
          UserModel.findOne({ _id: decoded.id })
            .then(user => {
              if (user) {
                req.tokenData = user;
                return next();
              } else {
                return next({
                  message: "user not found"
                });
              }
            })
            .catch(err => next(err));
        }
        // req.token_data = decoded;
      }
      // next();
    });
  };
};

module.exports = { SecureAPI };
