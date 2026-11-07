const express = require("express");
const matchService = require("./match.service");

function registerMatch(req, res, next) {
  try {
    const match = matchService.registerMatch(req.body);
    res.status(201).json({ ok: true, message: "Partida registrada", data: match });
  } catch (error) {
    next(error);
  }
}

function listMatches(req, res, next) {
  try {
    const matches = matchService.listMatches();
    res.status(200).json({ ok: true, count: matches.length, data: matches });
  } catch (error) {
    next(error);
  }
}

const router = express.Router();

router.get("/", listMatches);
router.post("/", registerMatch);

module.exports = router;
