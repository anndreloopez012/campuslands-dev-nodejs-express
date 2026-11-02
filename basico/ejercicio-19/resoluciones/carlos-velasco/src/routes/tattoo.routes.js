const express = require("express");
const tattooController = require("../controllers/tattoo.controller");

const router = express.Router();

router.get("/", tattooController.getTattoos);
router.get("/:id", tattooController.getTattooById);

module.exports = router;