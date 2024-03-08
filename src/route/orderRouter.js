const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');

router.post('/create', orderController.createOrder);
router.get('/get/table', orderController.getOrderByTableNumber);
router.get('/get/state', orderController.getOrderByState);
router.put('/update', orderController.updateState);
router.put('/cancel', orderController.cancelOrder);

module.exports = router;