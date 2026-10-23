import { Router } from "express";
import { getCars, getCar, postCar } from "../controllers/cars.controller.js";

const router = Router();

router.get("/", getCars);
router.get("/:id", getCar);
router.post("/", postCar);

export default router;
