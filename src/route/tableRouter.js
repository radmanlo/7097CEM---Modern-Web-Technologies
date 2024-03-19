const express = require('express');
const router = express.Router();
const tableConntroller = require("../controller/tableController");

router.post("/create", tableConntroller.createTable);
router.put("/update", tableConntroller.updateTable);
router.get("/getAll", tableConntroller.getAllTables);
router.put("/state", tableConntroller.changeStateTable);
router.put("/empty", tableConntroller.makeTableEmpty);
router.delete("/delete", tableConntroller.deleteTable);

module.exports = router;