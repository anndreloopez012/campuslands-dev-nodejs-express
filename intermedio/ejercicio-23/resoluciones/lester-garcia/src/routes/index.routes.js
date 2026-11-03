import { Router } from "express";
import weldsRouter from "./welds.routes.js";

const router = Router();

router.use("/welds", weldsRouter);

export default router;
