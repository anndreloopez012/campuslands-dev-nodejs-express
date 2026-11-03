import { Router } from "express";
import resourceRouter from "./sneakers.routes.js";

const router = Router();

router.use("/sneakers", resourceRouter);

export default router;
