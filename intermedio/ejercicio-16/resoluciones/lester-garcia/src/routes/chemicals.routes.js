import { Router } from "express";
import {
  getChemicalsController,
  getChemicalByIdController,
  createChemicalController,
  deleteChemicalController
} from "../controllers/chemicals.controller.js";
import { verifyJwt } from "../middlewares/authJwt.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { validate } from "../middlewares/validators/validate.middleware.js";
import { createChemicalValidator } from "../middlewares/validators/chemical.validator.js";

const router = Router();

// Todas las rutas de fórmulas químicas exigen sesión activa previa
router.use(verifyJwt);

// 1. Lectura: Permitida para todos los roles acreditados
router.get(
  "/",
  authorizeRoles("Investigador", "Quimico_Senior", "Director_Laboratorio"),
  getChemicalsController
);

router.get(
  "/:id",
  authorizeRoles("Investigador", "Quimico_Senior", "Director_Laboratorio"),
  getChemicalByIdController
);

// 2. Creación: Solo Químico Senior o Director
router.post(
  "/",
  authorizeRoles("Quimico_Senior", "Director_Laboratorio"),
  validate(createChemicalValidator),
  createChemicalController
);

// 3. Eliminación: Solo Director de Laboratorio
router.delete(
  "/:id",
  authorizeRoles("Director_Laboratorio"),
  deleteChemicalController
);

export default router;