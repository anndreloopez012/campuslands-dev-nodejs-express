const express = require("express");

const destinationsController = require("../controllers/destinations.controller");

const router = express.Router();

router.get("/", destinationsController.getDestinations);

router.get("/:id", destinationsController.getDestinationById);

module.exports = router;