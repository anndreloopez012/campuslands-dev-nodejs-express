const express = require("express");
const formulaController = require("../controllers/formula.controller");

const router = express.Router();

router.get("/", formulaController.getAllFormulas);
router.get("/:id", formulaController.getFormulaById);
router.post("/", formulaController.createFormula);
router.put("/:id", formulaController.updateFormula);
router.delete("/:id", formulaController.deleteFormula);

module.exports = router;