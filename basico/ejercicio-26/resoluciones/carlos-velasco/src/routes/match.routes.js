const express = require("express");
const matchController = require("../controllers/match.controller");

const router = express.Router();

router.get("/", matchController.getAllMatches);
router.get("/:id", matchController.getMatchById);
router.post("/", matchController.createMatch);
router.patch("/:id/start", matchController.startMatch);
router.delete("/:id", matchController.deleteMatch);

module.exports = router;