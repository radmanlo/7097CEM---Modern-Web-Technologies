const express = require('express');
const router = express.Router();
const authController = require('../controller/authController');

router.post('/signup', authController.signUp);
router.get('/signin', authController.signIn)

module.exports = router;