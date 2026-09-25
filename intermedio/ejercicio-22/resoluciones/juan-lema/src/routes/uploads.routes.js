import { Router } from "express";
import { getUploads, getUpload, postUpload } from "../controllers/uploads.controller.js";
import { receiveFile } from "../middlewares/receive-file.js";

const router = Router();

router.get("/", getUploads);
router.get("/:id", getUpload);
router.post("/", receiveFile, postUpload);

export default router;
