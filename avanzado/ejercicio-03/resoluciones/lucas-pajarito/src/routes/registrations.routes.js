import { Router } from "express";
import { getRegistrations, postRegistration } from "../controllers/registrations.controller.js";
import { validateBody } from "../schemas/validator.js";
import { registrationSchema } from "../schemas/registration.schema.js";

const router = Router();

router.get("/", getRegistrations);
router.post("/", validateBody(registrationSchema), postRegistration);

export default router;
