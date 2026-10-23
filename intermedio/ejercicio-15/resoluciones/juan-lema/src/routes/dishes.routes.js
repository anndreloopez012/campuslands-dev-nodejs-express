import { Router } from "express";
import { getDishes, getDish, postDish } from "../controllers/dishes.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.get("/", getDishes);
router.get("/:id", getDish);
router.post("/", authenticate, postDish);

export default router;
