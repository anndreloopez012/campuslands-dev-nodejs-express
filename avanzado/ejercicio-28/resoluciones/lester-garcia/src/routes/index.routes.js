import { Router } from "express";
import resourceRouter from "./arenas.routes.js";

const router = Router();

router.use("/arenas", resourceRouter);

export default router;
