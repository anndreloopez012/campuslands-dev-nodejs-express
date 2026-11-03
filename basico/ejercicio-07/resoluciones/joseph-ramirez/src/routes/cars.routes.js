const express = require("express");
const carsController = require("../controllers/cars.controller");

const router = express.Router();

router.get("/", carsController.getCars);
router.get("/:brand", carsController.getCarsByBrand);

module.exports = router;