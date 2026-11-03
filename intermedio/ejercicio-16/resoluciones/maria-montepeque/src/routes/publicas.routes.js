import { Router } from "express";
import { login } from "../controllers/auth.controller.js";
import { listSneakers, getSneaker } from "../controllers/sneakers.controller.js";

// rutas que cualquiera puede usar sin token
const router = Router();

router.post("/auth/login", login);
router.get("/sneakers", listSneakers);
router.get("/sneakers/:id", getSneaker);

export default router;
