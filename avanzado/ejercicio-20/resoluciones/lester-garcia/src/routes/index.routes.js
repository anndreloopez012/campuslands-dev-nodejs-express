import { Router } from "express";
import resourceRouter from "./commissions.routes.js";

const router = Router();

router.use("/commissions", resourceRouter);

export default router;
