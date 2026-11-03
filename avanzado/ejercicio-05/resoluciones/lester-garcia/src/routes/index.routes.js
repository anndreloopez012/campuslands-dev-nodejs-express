import { Router } from "express";
import resourceRouter from "./transfers.routes.js";

const router = Router();

router.use("/transfers", resourceRouter);

export default router;
