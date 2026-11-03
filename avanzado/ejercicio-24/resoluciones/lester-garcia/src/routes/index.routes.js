import { Router } from "express";
import resourceRouter from "./compounds.routes.js";

const router = Router();

router.use("/compounds", resourceRouter);

export default router;
