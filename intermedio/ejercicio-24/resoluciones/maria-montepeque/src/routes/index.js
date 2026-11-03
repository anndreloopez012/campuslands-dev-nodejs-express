import { Router } from "express";
import {
    listElementos,
    calcularMasa,
    listCompuestos,
    registrarCompuesto
} from "../controllers/quimica.controller.js";

const router = Router();

router.get("/elementos", listElementos);
router.get("/masa-molar", calcularMasa);
router.get("/compuestos", listCompuestos);
router.post("/compuestos", registrarCompuesto);

export default router;
