const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const randomString = require("randomstring");

const sendEmail = require("../../utils/mailer");
const UserModel = require("./user.model");

function mapped_user_req(user, userDetails) {
  if (userDetails.name) user.name = userDetails.name;
  if (userDetails.role) user.role = userDetails.role;
  if (userDetails.username) user.username = userDetails.username;
  if (userDetails.imgUrl) user.imgUrl = userDetails.imgUrl;
  if (userDetails.phone) user.phone = userDetails.phone;
  if (userDetails.gender) user.gender = userDetails.gender;
  if (userDetails.city || userDetails.about || userDetails.address) {
    user.extras = {
      city: userDetails.city,
      about: userDetails.about,
      address: userDetails.address,
      phone: userDetails.contact_no,
    };
  }

  return user;
}

class Users {
  constructor() {}

  // register new users
  singup(payload) {
    return new Promise((resolve, reject) => {
      UserModel.findOne({
        username: payload.username,
      }).then((user) => {
        if (user) {
          return reject({
            message: "User already exist please try another username",
          });
        }
        let newUser = new UserModel();
        newUser.name = payload.name;
        newUser.username = payload.username;
        if (payload.is_active) newUser.is_active = payload.is_active;
        bcrypt.genSalt(10, (err, salt) => {
          newUser.password["salt"] = salt;
          bcrypt.hash(payload.password, salt, (err, hash) => {
            newUser.password["hash"] = hash.slice(salt.length);
            mapped_user_req(newUser, payload)
              .save()
              .then(async (user) => {
                if (
                  user.username.match(
                    /^[a-zA-Z]+[a-zA-Z0-9._-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,4}$/
                  )
                ) {
                  await sendEmail(
                    "signup",
                    user.username,
                    "please verify your email!",
                    user
                  );
                }
                resolve(user);
              })
              .catch((err) => reject(err));
          });
        });
      });
    });
  }

  // login user
  login(payload) {
    return new Promise((resolve, reject) => {
      UserModel.findOne({
        username: payload.username,
      })
        .then((user) => {
          if (!user) {
            return reject({
              message: "Invalid Login Credentials",
            });
          }
          bcrypt
            .compare(
              payload.password,
              user.password["salt"] + user.password["hash"]
            )
            .then((isMatch) => {
              if (user.is_active) {
                if (isMatch) {
                  jwt.sign(
                    {
                      id: user._id,
                      name: user.name,
                      username: user.username,
                      role: user.role,
                    },
                    process.env.SECRET_KEY,
                    {
                      expiresIn: "5h",
                    },
                    (err, token) => {
                      resolve({
                        token: token,
                        user,
                      });
                    }
                  );
                } else {
                  return reject({
                    message: "Invalid Login Credentials",
                  });
                }
              } else {
                return reject({
                  message:
                    "Your account is deactivated, Please contact to admin.",
                });
              }
            });
        })
        .catch((err) => reject(err));
    });
  }

  getByEmail(email) {
    return UserModel.findOne({ username: email });
  }

  // get single user
  getOne(userId) {
    return new Promise((resolve, reject) => {
      UserModel.findById(userId)
        .then((user) => {
          if (user) {
            return resolve(user);
          } else {
            return reject({
              message: "User Not Found",
            });
          }
        })
        .catch((err) => reject(err));
    });
  }

  // change password
  async PasswordChange(payload, loggedInId) {
    const { password, new_password, confirm_password } = payload;
    try {
      const loggedInUser = await UserModel.findById(loggedInId);
      if (loggedInUser) {
        const isMatch = await bcrypt.compare(
          password,
          loggedInUser.password["salt"] + loggedInUser.password["hash"]
        );
        if (isMatch) {
          if (new_password && confirm_password) {
            const salt = bcrypt.genSaltSync(10);
            const hash =
              bcrypt.hashSync(new_password, salt) ||
              bcrypt.hashSync(confirm_password, salt);
            loggedInUser.password["salt"] = salt;
            loggedInUser.password["hash"] = hash.slice(salt.length);
            return loggedInUser.save();
          }
        } else {
          throw new Error("old password does not matched");
        }
      }
    } catch (err) {
      throw new Error(err);
    }
  }

  // get all users
  getAll() {
    return new Promise((resolve, reject) => {
      UserModel.aggregate([
        {
          $match: {},
        },
      ])
        .then((user) => resolve(user))
        .catch((err) => reject(err));
    });
  }

  // update user profile
  updateProfile(id, file, fileErr) {
    return new Promise((resolve, reject) => {
      UserModel.findById(id)
        .then((user) => {
          if (user) {
            if (fileErr) {
              return reject({
                message: "invalid File Format",
              });
            }
            if (file) {
              user.imgUrl = file.path;
            }
            user
              .save()
              .then((user) => resolve(user))
              .catch((err) => reject(err));
          }
        })
        .catch((err) => reject(err));
    });
  }

  // forgot password
  forgotPassword(payload) {
    return new Promise((resolve, reject) => {
      UserModel.findOne({
        username: payload.username,
      })
        .then((user) => {
          if (!user) {
            return reject({
              message:
                "User not found please Enter your already registered E-mail or Phone",
            });
          }
          // user.resetToken = Math.floor(Math.random() * 1000000 + 1);
          user.resetToken = randomString.generate(5);
          user.resetTokenExpire = new Date(Date.now() + 1000 * 60 * 60 * 2);
          user
            .save()
            .then(async (user) => {
              if (
                user.username.match(
                  /^[a-zA-Z]+[a-zA-Z0-9._-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,4}$/
                )
              ) {
                await sendEmail(
                  "forgotpassword",
                  user.username,
                  `${user.resetToken} is your homestay account recovery code`,
                  user
                );
              }
              resolve(user);
            })
            .catch((err) => reject(err));
        })
        .catch((err) => reject(err));
    });
  }

  updateUser(payload, id) {
    return new Promise((resolve, reject) => {
      UserModel.findById(id)
        .then((user) => {
          if (user) {
            mapped_user_req(user, payload)
              .save()
              .then((user) => {
                resolve(user);
              })
              .catch((err) => reject(err));
          } else {
            return reject({
              message: "User not found",
            });
          }
        })
        .catch((err) => reject(err));
    });
  }

  async findByIdAndUpdate(userId, orgId) {
    const loggedInUser = await UserModel.findById(userId);
    if (loggedInUser) {
      if (orgId) {
        loggedInUser.organizations.unshift(orgId);
        return loggedInUser.save();
      }
    }
  }

  // reset password
  resetPassword(payload) {
    return new Promise((resolve, reject) => {
      UserModel.findOne({
        resetToken: payload.resetToken,
        resetTokenExpire: {
          $gte: new Date(),
        },
      })
        .then((user) => {
          const { password, confirm_password } = payload;
          if (user) {
            if (password && confirm_password) {
              const salt = bcrypt.genSaltSync(10);
              const hash =
                bcrypt.hashSync(password, salt) ||
                bcrypt.hashSync(confirm_password, salt);
              user.password["salt"] = salt;
              user.password["hash"] = hash.slice(salt.length);
              user.resetToken = null;
              user.resetTokenExpire = null;
              user
                .save()
                .then((user) => resolve(user))
                .catch((err) => reject(err));
            }
          } else {
            return reject({
              message: "Invalid Reset Token or reset token link expires",
            });
          }
        })
        .catch((err) => reject(err));
    });
  }

  // list users with role
  listUsersWithRole(payload) {
    return new Promise((resolve, reject) => {
      UserModel.aggregate([
        {
          $match: {
            role: payload,
          },
        },
      ])
        .then((user) => resolve(user))
        .catch((err) => reject(err));
    });
  }

  // users register per month
  userRegisterPerMonth() {
    return new Promise((resolve, reject) => {
      UserModel.aggregate([
        {
          $match: {},
        },
        {
          $group: {
            _id: {
              month: {
                $month: "$created_at",
              },
            },
            data: {
              $push: "$$ROOT",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ])
        .then((user) => resolve(user))
        .catch((err) => reject(err));
    });
  }

  // send message
  sendMsg(payload) {
    sendEmail("sendmsg", process.env.MAIL_USER, `${payload.username}`, payload);
  }
}

module.exports = new Users();
