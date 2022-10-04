const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const _ = require("lodash");
const fs = require("fs");
const path = require("path");
let filePath;

module.exports = (action, send_to, subject, user) =>
  new Promise((resolve, reject) => {
    if (action == "signup") {
      filePath = "/../public/email_templates/signup.hbs";
    }

    if (action == "forgotpassword") {
      filePath = "/../public/email_templates/forgotpass.hbs";
    }

    if (action == "sendmsg") {
      filePath = "/../public/email_templates/contact.hbs";
    }

    if (action == "sendPassword") {
      filePath = "/../public/email_templates/password.hbs";
    }

    const readHTMLFile = (path, callback) => {
      fs.readFile(path, { encoding: "utf-8" }, (err, html) => {
        if (err) {
          callback(err);
        } else {
          callback(null, html);
        }
      });
    };

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
      }
    });

    console.log("user is here ", user)

    readHTMLFile(path.join(__dirname + filePath), (err, html) => {
      var template = handlebars.compile(html);
      var data = _.pick(user, ["name", "username", "resetToken", "message", "address", "phone","password"]);
      // var data = {
      //   name: user.name,
      //   username: user.username,
      //   resetToken: user.resetToken,
      //   UserId: user._id,
      //   message: user.message,
      //   address: user.address,
      //   phone: user.phone
      // };
      var htmlToSend = template(data);
      var mailOptions = {
        from: "everestkart@mailinator.com",
        to: send_to,
        subject: subject,
        html: htmlToSend
      };
      transporter.sendMail(mailOptions, (error, response) => {
        if (error) {
          reject(error);
        }
        resolve(response);
      });
    });
  });
