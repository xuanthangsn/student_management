const express = require("express");

const app = express();
const appRoute = require("../routes/index.js");
require("dotenv").config();
const port = process.env.PORT || 8000;

const cookieParser = require("cookie-parser");

app.use(express.json());
app.use(cookieParser());

app.use("/api", appRoute);

// error handle middleware
// if the precedent middleware call next(err), the request will be handled by this middleware right afterward 
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || "Something is broken";
  return req.status(status).json({ message });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
