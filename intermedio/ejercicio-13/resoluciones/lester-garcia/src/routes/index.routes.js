import { Router } from "express";
import planetsRouter from "./planets.routes.js";
import starshipsRouter from "./starships.routes.js";

const router = Router();

router.use("/planets", planetsRouter);
router.use("/starships", starshipsRouter);

export default router;