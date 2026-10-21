import { Router } from "express";
import { loginController, getProfileController } from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { loginValidator } from "../middlewares/validators/auth.validator.js";

const router = Router();

// Ruta pública de autenticación
router.post("/login", validate(loginValidator), loginController);

// Ruta protegida que requiere token
router.get("/me", authenticate, getProfileController);

export default router;