const appRoute = require("express")();
const authRoute = require("./auth.route");
const userRoute = require("./user.route");
const studentRoute = require("./student.route");

appRoute.use("/auth", authRoute);
appRoute.use("/user", userRoute);
appRoute.use("/student", studentRoute);
module.exports = appRoute;
