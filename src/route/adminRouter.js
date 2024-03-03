const express = require('express');
const router = express.Router();
const adminController = require("../controller/adminController");

router.put("/changeRole", adminController.userRoleChanger)

module.exports = router