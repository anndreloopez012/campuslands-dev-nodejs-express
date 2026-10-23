const express = require("express");
const motorcyclesController = require("../controllers/motorcycles.controller");

const router = express.Router();

router.get("/", motorcyclesController.getMotorcycles);
router.get("/ficha/:fileName", motorcyclesController.getMotorcycleFicha);

module.exports = router;