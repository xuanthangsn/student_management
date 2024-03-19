const { body, param } = require("express-validator");

module.exports = {
  login: [body("email").isEmail(), body("password").isString()],
  createUser: [
    body("email").isEmail(),
    body("firstname").isString(),
    body("lastname").isString(),
    body("role").isIn(["admin", "qlht"]),
    body("gender").isIn(["male", "female"]),
  ],
  resendConfirmationLink: [param("email").isEmail()],
};
