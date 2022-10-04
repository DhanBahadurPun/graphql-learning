const router = require("express").Router();
const {
  check,
  body,
  oneOf,
  validationResult,
} = require("express-validator/check");

const UserController = require("./user.controller");
const upload = require("../../utils/image.upload");
const { SecureAPI } = require("../../utils/secure");

//Register new user
router.post(
  "/",
  oneOf([
    check("username")
      .isEmail()
      .withMessage("username must be either Email or Phone")
      .matches(/^[a-zA-Z]+[a-zA-Z0-9._-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,4}$/)
      .withMessage("email must be valid email"),
    check("username")
      .isMobilePhone()
      .withMessage("username must be either email or phone")
      .matches(/^[0-9]{10}$/)
      .withMessage("phone must be integer and 10 digits"),
  ]),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ message: errors.array()[0].nestedErrors[0].msg });
    } else {
      UserController.singup(req.body)
        .then((user) => {
          req.flash("success", "Registration is successful please login");
          res.status(200).json(user);
        })
        .catch((err) => next(err));
    }
  }
);

router.post("/login", async (req, res, next) => {
  try {
    let d = await UserController.login(req.body);
    res.cookie("access_token", d.token);
    res.cookie(
      "user",
      JSON.stringify({
        name: d.user.name,
        id: d.user.id,
        role: d.user.role,
      })
    );
    res.status(200).json(d);
  } catch (e) {
    next(e);
  }
});

// get User Profile
router.get("/getProfile/:id", (req, res, next) => {
  UserController.getOne(req.params.id)
    .then((user) => res.status(200).json(user))
    .catch((err) => next(err));
});

// change password
router.post(
  "/changepassword",
  SecureAPI(),
  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.new_password) {
      throw new Error("New Password and Confirmation Password must be matched");
    } else {
      return true;
    }
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ message: errors.array()[0].msg });
    } else {
      UserController.PasswordChange(req.body, req.tokenData._id)
        .then((user) => {
          res.status(200).json(user);
        })
        .catch((err) => next(err));
    }
  }
);

// get all users
router.get("/", (req, res, next) => {
  UserController.getAll()
    .then((user) => res.json(user))
    .catch((err) => next(err));
});

// upload user profile
router.post("/update/:id", upload.single("imgUrl"), (req, res, next) => {
  UserController.updateProfile(req.params.id, req.file, req.fileErr)
    .then((user) => res.json(user))
    .catch(next((err) => next(err)));
});

// forgot password
router.post("/forgotpassword", (req, res, next) => {
  UserController.forgotPassword(req.body)
    .then((user) => {
      req.flash("success", "Recovery token is send please check your email!");
      res.status(200).json(user);
    })
    .catch((err) => next(err));
});

//update user details
router.put("/updateuser/:id", (req, res, next) => {
  UserController.updateUser(req.body, req.params.id)
    .then((user) => {
      res.cookie(
        "user",
        JSON.stringify({
          name: user.name,
          id: user.id,
          role: user.role,
        })
      );
      res.status(200).json(user);
    })
    .catch((err) => next(err));
});

//reset password
router.post(
  "/resetpassword",
  body("confirm_password").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Password and confirmation Password does not match");
    } else {
      return true;
    }
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ message: errors.array()[0].msg });
    } else {
      UserController.resetPassword(req.body)
        .then((user) => {
          req.flash(
            "success",
            "Reset Password Success please login with new Password"
          );
          res.status(200).json(user);
        })
        .catch((err) => {
          req.flash("error", err.message);
          next(err);
        });
    }
  }
);

// list users with role
router.post("/listUsersWithRole", (req, res, next) => {
  UserController.listUsersWithRole(req.body.role)
    .then((user) => res.status(200).json(user))
    .catch((err) => next(err));
});

// users register per month
router.get("/userPerMonth", (req, res, next) => {
  UserController.userRegisterPerMonth()
    .then((user) => res.status(200).json(user))
    .catch((err) => next(err));
});

// send message
router.post("/sendmsg", async (req, res, next) => {
  try {
    const msg = await UserController.sendMsg(req.body);
    res.status(200).json(msg);
  } catch (e) {
    next(e);
  }
});

router.get("/:email", async (req, res, next) => {
  try {
    let doc = await UserController.getByEmail(req.params.email);
    console.log("hi", doc);
    res.status(200).json(doc);
  } catch (e) {
    throw e;
  }
});

module.exports = router;
