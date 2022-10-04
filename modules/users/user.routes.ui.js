const router = require("express").Router();
const UserController = require("./user.controller");
const { SecureAPI } = require("../../utils/secure");

const dashboardLayout = "layouts/dashboard.ejs";

router.get("/register", (req, res) => {
  res.render("users/register", { title: "User Register" });
});

router.get("/logout", (req, res, next) => {
  res.clearCookie("access_token");
  res.clearCookie("user");
  res.redirect("/users/login");
});

router.get("/dashboard", SecureAPI(), (req, res, next) => {
  let data = {
    layout: dashboardLayout,
    title: "Welcome - Dashboard"
  };
  res.render("dashboard", data);
});

router.get("/login", (req, res) => {
  let errMsg = req.flash("error");
  let successMsg = req.flash("success");
  if (errMsg.length || successMsg.length) {
    errMsg = errMsg[0];
    successMsg = successMsg[0];
  } else {
    errMsg = null;
    successMsg = null;
  }
  res.render("users/login", {
    title: "Login",
    errMessage: errMsg,
    successMessage: successMsg
  });
});

router.get("/forgotpassword", (req, res) => {
  let successMsg = req.flash("success");
  let errMsg = req.flash("error");
  if (successMsg.length || errMsg.length) {
    successMsg = successMsg[0];
    errMsg = errMsg[0];
  } else {
    successMsg = null;
    errMsg = null;
  }
  res.render("users/forgotpassword", {
    title: "Forgot Password",
    errMessage: errMsg,
    successMessage: successMsg
  });
});

router.get("/resetpassword", (req, res, next) => {
  let errMsg = req.flash("error");
  if (errMsg.length) {
    errMsg = errMsg[0];
  } else {
    errMsg = null;
  }
  res.render("users/resetpassword", {
    title: "Reset Password",
    errMessage: errMsg
  });
});

router.get("/profile", SecureAPI(), (req, res, next) => {
  UserController.getOne(req.tokenData.id).then(user =>
    res.render("users/my-profile", {
      layout: "layouts/dashboard.ejs",
      title: "My Profile",
      user: user
    })
  );
});

router.get("/packages", (req, res, next) => {
  res.render("users/packages", {
    layout: "layouts/dashboard.ejs",
    title: "Packages"
  });
});

router.get("/blank-page", (req, res, next) => {
  res.render("users/blank-page", {
    layout: "layouts/dashboard.ejs",
    title: "Blank Page"
  });
});

router.get("/psw-change", SecureAPI(), (req, res, next) => {
  res.render("users/change-password", {
    layout: "layouts/dashboard.ejs",
    title: "Change Password"
  });
});

module.exports = router;
