import { Router } from "express";
import resourceRouter from "./tracks.routes.js";

const router = Router();

router.use("/tracks", resourceRouter);

export default router;
