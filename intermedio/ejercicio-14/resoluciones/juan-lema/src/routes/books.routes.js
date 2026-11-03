import { Router } from "express";
import { getBooks, getBook, postBook } from "../controllers/books.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.get("/", getBooks);
router.get("/:id", getBook);
router.post("/", authenticate, postBook);

export default router;
