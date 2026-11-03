import { Router } from "express";
import resourceRouter from "./matches-csv.routes.js";

const router = Router();

router.use("/matches-csv", resourceRouter);

export default router;
