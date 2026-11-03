import { Router } from "express";
import resourceRouter from "./raids.routes.js";

const router = Router();

router.use("/raids", resourceRouter);

export default router;
