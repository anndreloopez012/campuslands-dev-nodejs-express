import express from "express";
import { getMoto } from "../controllers/moto.controller.js";

const router = express.Router();

router.get("/:fileName", getMoto);

export default router;