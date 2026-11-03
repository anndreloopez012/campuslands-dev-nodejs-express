import { Router } from "express";
import resourceRouter from "./luxury-cars.routes.js";

const router = Router();

router.use("/luxury-cars", resourceRouter);

export default router;
