const router = require("express").Router();

const authController = require("../controllers/auth.controller");
const authValidator = require("../validations/auth.validation");
const { isAuthenticated } = require("../middlewares/isAuthenticated");
const isAuthorized = require("../middlewares/isAuthorized");

router.post("/login", authValidator.login, authController.login);
router.post(
  "/register",
  authValidator.createUser,
  isAuthenticated,
  isAuthorized("admin"),
  authController.createUser
);
router.get(
  "/resendVerificationEmail/:email",
  authValidator.resendConfirmationLink,
  isAuthenticated,
  isAuthorized("admin"),
  authController.resendConfirmationLink
);
router.get("/confirmEmail/:emailToken", authController.confirmEmail);

module.exports = router;
