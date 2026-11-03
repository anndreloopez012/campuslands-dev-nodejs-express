import { Router } from "express";
import {
    verConfig,
    listDisenos,
    createDiseno,
    listCitas,
    createCita
} from "../controllers/estudio.controller.js";
import requireApiKey from "../middlewares/api-key.middleware.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/config", "/api/disenos", "/api/citas"] });
});

router.get("/config", verConfig);

router.get("/disenos", listDisenos);
router.post("/disenos", requireApiKey, createDiseno);

router.get("/citas", listCitas);
router.post("/citas", createCita);

export default router;
