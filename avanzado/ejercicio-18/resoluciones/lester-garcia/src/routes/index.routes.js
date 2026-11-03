import { Router } from "express";
import resourceRouter from "./jumps.routes.js";

const router = Router();

router.use("/jumps", resourceRouter);

export default router;
