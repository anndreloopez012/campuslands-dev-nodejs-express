const express = require("express");
const configController = require("../controllers/config.controller");

const router = express.Router();

router.get("/health", configController.getHealth);
router.get("/config", configController.getConfig);

module.exports = router;