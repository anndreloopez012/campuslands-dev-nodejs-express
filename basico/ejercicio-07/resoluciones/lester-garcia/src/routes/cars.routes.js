import { Router } from "express";
import { getCarsController } from "../controllers/cars.controller.js";

const router = Router();

router.get("/cars", getCarsController);

export default router;