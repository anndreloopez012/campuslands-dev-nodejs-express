import { Router } from "express";
import formulasRouter from "./formulas.routes.js";

const router = Router();

router.use("/formulas", formulasRouter);

export default router;
