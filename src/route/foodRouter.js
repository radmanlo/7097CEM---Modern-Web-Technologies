const express = require('express');
const router = express.Router();
const foodController = require('../controller/foodController');

router.post("/create", foodController.createFood);
router.get("/getAll", foodController.getAllFoods);
router.put("/state", foodController.changeState);
router.put("/update", foodController.updateFood);
router.delete("/delete", foodController.deleteFood);

module.exports = router;