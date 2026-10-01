const express = require("express");
const drawingController = require("../controllers/drawing.controller");

const router = express.Router();

router.get("/", drawingController.getDrawings);
router.post("/", drawingController.createDrawing);

module.exports = router;