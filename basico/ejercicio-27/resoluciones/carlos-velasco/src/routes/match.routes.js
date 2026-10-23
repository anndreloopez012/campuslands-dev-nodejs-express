const express = require("express");
const matchController = require("../controllers/match.controller");

const router = express.Router();

router.get("/", matchController.getMatches);
router.post("/", matchController.createMatch);

module.exports = router;