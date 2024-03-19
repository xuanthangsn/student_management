const router = require("express").Router();

const { isAuthenticated } = require("../middlewares/isAuthenticated");
const isAuthorized = require("../middlewares/isAuthorized");

const studentController = require("../controllers/student.controller");
const studentValidator = require("../validations/student.validation");


router.get("/", studentValidator.getAll, studentController.getAll);
router.get("/:id", studentController.getOne);

router.put(
  "/bulkUpdate",
  studentValidator.bulkUpdate,
  studentController.bulkUpdate
);
router.put("/:id", studentValidator.update, studentController.update);

router.delete("/:id", studentController.delete);
router.post("/", studentValidator.create, studentController.create);
module.exports = router;
