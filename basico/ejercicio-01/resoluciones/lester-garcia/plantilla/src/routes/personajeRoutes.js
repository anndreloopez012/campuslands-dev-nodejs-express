import express from "express";
import { obtenerPersonajeController } from "../controllers/personajeController.js";

const router = express.Router();

router.get("/", obtenerPersonajeController);

export default router;
