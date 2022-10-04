const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

module.exports = {
  Query: {
    async getAllUsers(_, args, { models: { UserModel } }) {
      const users = await UserModel.findOne({});
      return users;
    },
    async getOneUser(_, { id }, { models: { UserModel } }) {
      const user = await UserModel.findById(id);
      return user;
    },
  },
  Mutation: {
    async userSignup(_, payload, { models: { UserModel } }) {
      const { name, username, gender, phone, password, role, is_active } =
        payload.newUser;
      const user = await UserModel.findOne({ username });

      if (user) {
        throw new Error("User already exist please try another username");
      }

      let newUser = new UserModel();
      newUser.name = name;
      newUser.username = username;
      if (is_active) newUser.is_active = is_active;
      newUser.phone = phone;
      newUser.gender = gender;
      newUser.role = role;
      const salt = await bcrypt.genSalt(12);
      const hash = await bcrypt.hash(password, salt);
      newUser.password["salt"] = salt;
      newUser.password["hash"] = hash.slice(salt.length);
      return await newUser.save();
    },

    async userLogin(_, { loginInfo }, { models: { UserModel } }) {
      const { username, password } = loginInfo;
      const user = await UserModel.findOne({ username });

      if (!user) {
        throw new Error("Invalid Login Credentials!");
      }

      if (user.is_active) {
        const match = await bcrypt.compare(
          password,
          user.password["salt"] + user.password["hash"]
        );
        if (match) {
          const token = jwt.sign(
            { id: user._id, username: user.username, role: user.role },
            process.env.SECRET_KEY,
            { expiresIn: "5h" }
          );

          return {
            token,
            user,
          };
        } else {
          throw new Error("Invalid Login Credential!");
        }
      } else {
        throw new Error("our account is deactivated, Please contact to admin!");
      }
    },
  },

  // Subcriptions
};
