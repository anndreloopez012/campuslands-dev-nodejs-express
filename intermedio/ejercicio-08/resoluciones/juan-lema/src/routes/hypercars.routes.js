import { Router } from "express";
import { getHypercars, getHypercar, postHypercar } from "../controllers/hypercars.controller.js";

const router = Router();

router.get("/", getHypercars);
router.get("/:id", getHypercar);
router.post("/", postHypercar);

export default router;
