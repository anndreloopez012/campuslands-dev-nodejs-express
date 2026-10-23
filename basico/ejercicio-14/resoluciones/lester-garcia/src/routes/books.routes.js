import { Router } from "express";
import {
  getBooksController,
  getBookByIdController,
  createBookController
} from "../controllers/books.controller.js";
import {
  validateCreateBook,
  validateBookId
} from "../middlewares/validation.middleware.js";

const router = Router();

router.get("/books", getBooksController);
router.get("/books/:id", validateBookId, getBookByIdController);
router.post("/books", validateCreateBook, createBookController);

export default router;