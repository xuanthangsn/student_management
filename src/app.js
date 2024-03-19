const express = require("express");

const app = express();
const appRoute = require("../routes/index.js");
require("dotenv").config();
const port = process.env.PORT || 8000;

const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { isAuthenticated } = require("../middlewares/isAuthenticated.js");
const isAuthorized = require("../middlewares/isAuthorized.js");
const { body, validationResult, matchedData} = require("express-validator");

const knex = require("../db.js");

app.use(express.json());
app.use(cookieParser());


app.use("/test",[body('*.name').exists(), body('*.age').exists()],async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.json(errors);
  }
  const data = matchedData(req);
  console.log(data);
  res.json(data);
});

app.use("/api", appRoute);

app.use("/", (err, req, res, next) => {
  console.log("enter err catcher");
  console.log(err);
  res.send("hahaha");
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

const sample = {
  id: {
    lt: 100,
    gt: 10,
  },
  firstname: { eq: "xuanthang" },
  email: { eq: "xuanthangsn@gmail.com" },
  gender: { lt: "fe fucking male", gt: "wrong value" },
  email_verified: { eq: false },
};
