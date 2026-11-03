import { Router } from "express";
import authRouter from "./auth.routes.js";
import booksRouter from "./books.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/books", booksRouter);

export default router;