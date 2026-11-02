import { Router } from "express";
import config from "../config.js";
import { crearRateLimit } from "../middlewares/rate-limit.middleware.js";
import { listModelos, listRenders, crearRender, verLimites } from "../controllers/renders.controller.js";

const router = Router();

const limiteGeneral = crearRateLimit({
    nombre: "general",
    ...config.limiteGeneral
});

const limiteRender = crearRateLimit({
    nombre: "renders",
    ...config.limiteRender,
    mensaje: "Pediste muchos renders seguidos, espera antes de pedir otro"
});

// /limites va antes del limitador para poder consultarlo aunque ya no queden peticiones
router.get("/limites", verLimites);

// el general cuenta todas las peticiones de /api
router.use(limiteGeneral);

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/modelos", "/api/renders", "/api/limites"] });
});

router.get("/modelos", listModelos);
router.get("/renders", listRenders);
// crear un render pasa por los dos limites
router.post("/renders", limiteRender, crearRender);

export default router;
