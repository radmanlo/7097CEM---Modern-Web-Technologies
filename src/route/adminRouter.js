const express = require('express');
const router = express.Router();
const adminController = require("../controller/adminController");

router.put("/changeRole", adminController.userRoleChanger);
router.get('/users', adminController.getUsers);
router.delete("/delete", adminController.deleteUser);

module.exports = router