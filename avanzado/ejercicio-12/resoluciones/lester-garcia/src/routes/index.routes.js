import { Router } from "express";
import resourceRouter from "./horror-movies.routes.js";

const router = Router();

router.use("/horror-movies", resourceRouter);

export default router;
