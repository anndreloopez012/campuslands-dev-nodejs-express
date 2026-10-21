import { Router } from "express";
import {
  getBooksController,
  getBookByIdController,
  createBookController,
  deleteBookController
} from "../controllers/books.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createBookValidator } from "../middlewares/validators/book.validator.js";

const router = Router();

// Rutas Públicas (Lectores no registrados pueden consultar)
router.get("/", getBooksController);
router.get("/:id", getBookByIdController);

// Rutas Privadas / Protegidas (Requieren token válido)
router.post("/", authenticate, validate(createBookValidator), createBookController);
router.delete("/:id", authenticate, deleteBookController);

export default router;