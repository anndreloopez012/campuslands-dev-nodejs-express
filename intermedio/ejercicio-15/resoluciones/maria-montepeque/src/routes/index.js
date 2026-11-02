import { Router } from "express";
import { login, perfil } from "../controllers/auth.controller.js";
import { listPlatos, misPedidos, createPedido } from "../controllers/pedidos.controller.js";
import requireAuth from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/auth/login", "/api/auth/perfil", "/api/platos", "/api/pedidos"] });
});

// publicas
router.post("/auth/login", login);
router.get("/platos", listPlatos);

// protegidas con jwt
router.get("/auth/perfil", requireAuth, perfil);
router.get("/pedidos", requireAuth, misPedidos);
router.post("/pedidos", requireAuth, createPedido);

export default router;
