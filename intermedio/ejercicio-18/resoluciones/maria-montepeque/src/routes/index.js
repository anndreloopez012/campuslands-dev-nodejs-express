import { Router } from "express";
import { registro, login, cambiarPassword, listar } from "../controllers/auth.controller.js";
import { hash, baseDeDatos } from "../controllers/demo.controller.js";

const router = Router();

router.get("/", (req, res) => {
    res.json({ ok: true, resources: ["/api/auth", "/api/paracaidistas", "/api/demo"] });
});

router.post("/auth/registro", registro);
router.post("/auth/login", login);
router.patch("/auth/password", cambiarPassword);

router.get("/paracaidistas", listar);

// solo para el ejercicio, para ver como funciona el hash
router.get("/demo/hash", hash);
router.get("/demo/base-de-datos", baseDeDatos);

export default router;
