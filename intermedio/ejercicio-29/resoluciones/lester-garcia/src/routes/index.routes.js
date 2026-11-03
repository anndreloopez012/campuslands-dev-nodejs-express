import { Router } from "express";
import clubsRouter from "./clubs.routes.js";

const router = Router();

router.use("/clubs", clubsRouter);

export default router;
