const express = require("express");

const {
  getWeldings,
  getWeldingById,
  createWelding,
  deleteWelding
} = require("../controllers/welding.controller");

const router = express.Router();

router.get("/", getWeldings);
router.get("/:id", getWeldingById);
router.post("/", createWelding);
router.delete("/:id", deleteWelding);

module.exports = router;