import { Router } from "express";
import {
  getAllCharactersController,
  getCharacterByIdController,
  createCharacterController,
  updateCharacterController,
  deleteCharacterController
} from "../controllers/rpg.controller.js";

const router = Router();

router.get("/characters", getAllCharactersController);
router.get("/characters/:id", getCharacterByIdController);
router.post("/characters", createCharacterController);
router.put("/characters/:id", updateCharacterController);
router.delete("/characters/:id", deleteCharacterController);

export default router;