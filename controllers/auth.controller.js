require("dotenv").config();

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const nodemailer = require("nodemailer");
const formatDateObject = require("../helpers/formatDateObject.js");
const generateUniqueNumber = require("../helpers/generateUniqueNumber.js");
const knex = require("../db.js");

const createToken = (payload) => {
  const tokenLiveTime =
    process.env.JWT_TOKEN_TIME_TO_LIVE_IN_DAY * 24 * 60 * 60 * 1000;
  return jwt.sign(payload, process.env.JWT_TOKEN_SECRET, {
    expiresIn: tokenLiveTime,
  });
};

const createEmailToken = (payload) => {
  const tokenLiveTime =
    process.env.EMAIL_TOKEN_TIME_TO_LIVE_IN_DAY * 24 * 60 * 60 * 1000;
  return jwt.sign(payload, process.env.EMAIL_SECRET, {
    expiresIn: tokenLiveTime,
  });
};

/*
 *  Create a email jwt token and send to the given email address
 */
const sendConfirmationEmail = (promiseOption, email, callback) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // create email jwt token
  const jwtEmailToken = createEmailToken({ email });
  const confirmationLink = `localhost:3000/api/auth/confirmEmail/${jwtEmailToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject: "[Student Management] Verify your email address",
    text: `Click this link to verify your email address ${confirmationLink}`,
  };

  if (promiseOption) {
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          reject(err);
        } else {
          resolve(info);
        }
      });
    });
  }

  transporter.sendMail(mailOptions, (err, infor) => {
    if (err) {
      return callback(err);
    }
    return callback(null, infor);
  });
};

const generateUniqueUsername = async (name) => {
  try {
    const uniqueNumber = await generateUniqueNumber();
    return name + uniqueNumber;
  } catch (err) {
    throw new Error("Failed to generate username");
  }
};

const generateRandomStrongPassword = (length = 6) => {
  const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
  const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numericChars = "0123456789";
  const specialChars = "!@#$%^&*()-_=+[]{}|;:,.<>?";
  const allChars =
    lowercaseChars + uppercaseChars + numericChars + specialChars;

  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * allChars.length);
    password += allChars.charAt(randomIndex);
  }

  return password;
};

module.exports = {
  login: async (req, res, next) => {
    const { email, password } = req.body;

    // try to retrieve an user with the given email
    let user;
    try {
      const rows = await knex("users").select("*").where("email", email);
      user = rows[0];
    } catch (err) {
      return res.status(500).json({ message: "Failed to query database" });
    }

    if (!user) {
      return res.status(401).json({
        message: "Authentication credentials areư missing or incorrect",
      });
    }

    if (!user.email_verified) {
      return res.status(401).json({
        message: "This account is not verified",
      });
    }

    const passMatch = await bcrypt.compare(password, user.password);
    if (!passMatch) {
      return res.status(401).json({
        message: "Authentication credentials are missing or incorrect",
      });
    }

    const token = createToken({ userId: user.id });

    res.status(200).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        username: user.username,
      },
    });
  },

  logout: async (req, res, next) => {},

  // suppose that body request has already be validated properly. That is
  // email is in the right format, firstname and lastname is string and not too long,...
  createUser: async (req, res, next) => {
    const { email, firstname, lastname, role, gender } = req.body;
    const currentUser = req.user;

    // check whether email is already being used or not
    try {
      const rows = await knex("users").select("*").where("email", email);
      if (rows.length !== 0) {
        return res.status(400).json({
          message: "Email is already taken",
        });
      }
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error querying database" });
    }

    // generate username and password
    const username = await generateUniqueUsername(firstname + lastname);
    const password = generateRandomStrongPassword(6);
    const hashPass = await bcrypt.hash(password, 12);

    // create new user
    let newUserId;
    try {
      const result = await knex("users").insert({
        email,
        firstname,
        lastname,
        role,
        gender,
        username,
        password: hashPass,
        created_by: currentUser.id,
        created_at: formatDateObject(new Date()),
      });
      newUserId = result[0].insertId;
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to create new user" });
    }

    // send confirmation link through email
    sendConfirmationEmail(false, email, (err, info) => {
      if (err) {
        console.log(err);
        console.log(`Failed to send confirmation link to ${email}`);
      } else {
        console.log("Send confirmation link successfully");
      }
    });

    // response to the client
    return res.status(201).json({
      message: "New user created successfully",
      user: {
        id: newUserId,
        email,
        password,
      },
    });
  },

  resendConfirmationLink: async (req, res, next) => {
    const email = req.params.email;

    // retrive user associated with the given email address
    let user;
    try {
      const rows = await knex("users").select("*").where("email", email);
      if (rows.length === 0) {
        return res.status(400).json({
          message: "No user account is associated with this email",
        });
      }
      user = rows[0];
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error querying database" });
    }

    if (user.email_verified) {
      return res.status(400).json({
        message: "This email is already verified",
      });
    }

    // determine if user can trigger resend email again
    if (user.email_verification_last_sent_at) {
      const elapsed = Math.floor(
        (new Date().getTime() -
          new Date(user.email_verification_last_sent_at).getTime()) /
          1000
      );
      if (elapsed < process.env.EMAIL_VERIFICATION_RESEND_AFTER * 60) {
        return res.status(400).json({
          message: `Try again after ${
            process.env.EMAIL_VERIFICATION_RESEND_AFTER * 60 - elapsed
          } seconds`,
        });
      }
    }

    // now allow verification email resend
    try {
      await sendConfirmationEmail(true, email);
    } catch (err) {
      return res.status(500).json({
        message: "Failed to send confirmation email",
      });
    }

    // udpate last time mail resend
    try {
      await knex("users")
        .update({
          "email_verification_last_sent-at": formatDateObject(new Date()),
        })
        .where("email", email);
    } catch (err) {
      return res.status(500).json({
        message:
          "Successfully send verification email but failed to update user record",
      });
    }

    return res.status(200).json({
      message: "Successfully send verification email",
    });
  },

  confirmEmail: async (req, res, next) => {
    const emailToken = req.params.emailToken;
    let email;
    try {
      const jwtPayload = jwt.verify(emailToken, process.env.EMAIL_SECRET);
      email = jwtPayload.email;
    } catch (err) {
      return res.status(401).json({
        message: "Verification link is either expired or invalid",
      });
    }

    let user;
    try {
      const rows = await knex("users").select("*").where("email", email);
      if (rows.length === 0) {
        return res.status(400).json({
          message: "No user is associated with this email",
        });
      }
      user = rows[0];
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error querying database" });
    }

    if (user.email_verified) {
      return res.status(400).json({
        messsage: "User is already verified",
      });
    }
    try {
      await knex("users").update("email_verified", true).where("email", email);
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Failed to update user" });
    }

    return res.status(200).json({
      message: "Email verified successfully",
    });
  },
  sendConfirmationEmail,
};
