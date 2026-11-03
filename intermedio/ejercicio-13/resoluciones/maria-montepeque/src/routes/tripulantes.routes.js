import { Router } from "express";
import {
    listTripulantes,
    getTripulante,
    createTripulante,
    deleteTripulante
} from "../controllers/tripulantes.controller.js";

const router = Router();

router.get("/", listTripulantes);
router.post("/", createTripulante);
router.get("/:id", getTripulante);
router.delete("/:id", deleteTripulante);

export default router;
