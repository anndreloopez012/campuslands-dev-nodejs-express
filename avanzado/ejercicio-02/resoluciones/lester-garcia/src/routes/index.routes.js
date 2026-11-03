import { Router } from "express";
import resourceRouter from "./lobbies.routes.js";

const router = Router();

router.use("/lobbies", resourceRouter);

export default router;
