import { Router } from "express";
import resourceRouter from "./renders.routes.js";

const router = Router();

router.use("/renders", resourceRouter);

export default router;
