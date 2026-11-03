import { Router } from "express";
import resourceRouter from "./books.routes.js";

const router = Router();

router.use("/books", resourceRouter);

export default router;
