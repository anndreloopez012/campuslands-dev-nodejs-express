import { Router } from "express";
import tattoosRouter from "./tattoos.routes.js";

const router = Router();

router.use("/tattoos", tattoosRouter);

export default router;
