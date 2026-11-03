import { Router } from "express";
import { galeria } from "../controllers/obras.controller.js";

const router = Router();

router.get("/", galeria);

export default router;
