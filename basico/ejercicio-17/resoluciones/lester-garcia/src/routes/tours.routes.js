import { Router } from "express";
import {
  getToursController,
  getTourByIdController,
  getFeaturedToursController
} from "../controllers/tours.controller.js";

const router = Router();

// Rutas GET
router.get("/tours", getToursController);
router.get("/tours/featured", getFeaturedToursController);
router.get("/tours/:id", getTourByIdController);

export default router;