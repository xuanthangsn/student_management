require("dotenv").config();
const jwt = require("jsonwebtoken");
const knex = require("../db");

const authenticateViaAuthorizationHeader = async (req, res, next) => {
  if (!req.user && req.headers.authorization) {
    const token = req.headers.authorization
      .split(" ")
      .filter((e) => e !== "")[1];

    // parse user id from token
    let userId;
    try {
      userId = jwt.verify(token, process.env.JWT_TOKEN_SECRET).id;
    } catch (err) {
      console.log(err);
      return next();
    }

    // query user's information using userId
    try {
      const rows = await knex("users").select("*").where("id", userId);
      // if user not found
      if (rows.length === 0) {
        return next();
      }

      req.user = rows[0];
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error querying data",
      });
    }
  }

  next();
};

const authenticateViaCookie = async (req, res, next) => {
  if (!req.user) {
    let id;
    if (!(id = req.cookies.id)) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    try {
      const rows = await knex("users").select("*").where("id", id);

      // no user found!
      if (rows.length === 0) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }
      req.user = rows[0];
      return next();
    } catch (err) {
      console.log(err);
      return res.status(500).json({ message: "Error querying database" });
    }
  }
  return next();
};

module.exports = {
  authenticateViaAuthorizationHeader,
  authenticateViaCookie,
  isAuthenticated: [authenticateViaAuthorizationHeader, authenticateViaCookie],
};
