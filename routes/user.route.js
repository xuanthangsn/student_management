
const userController = require("../controllers/user.controller");
const router = require("express").Router();
const userValdiator = require('../validations/user.validation');
const {isAuthenticated} = require('../middlewares/isAuthenticated');
const isAuthorized = require('../middlewares/isAuthorized');


router.get('/',userValdiator.getAll, isAuthenticated ,userController.getAll);
router.get('/:id', isAuthenticated, userController.getOne);
router.put('/:id',  userValdiator.update, isAuthenticated ,userController.update);
router.delete('/:id', isAuthenticated, isAuthorized('admin'), userController.delete);
module.exports = router;