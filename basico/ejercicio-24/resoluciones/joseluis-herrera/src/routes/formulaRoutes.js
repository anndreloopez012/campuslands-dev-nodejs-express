import express from "express";

import {
    listarFormulas,
    buscarFormula,
    registrarFormula,
    modificarFormula,
    borrarFormula
} from "../controllers/formulaController.js";

const router = express.Router();

router.get("/", listarFormulas);

router.get("/:id", buscarFormula);

router.post("/", registrarFormula);

router.put("/:id", modificarFormula);

router.delete("/:id", borrarFormula);

export default router;