import { Router } from "express";
import { getJobs, getJob, postJob } from "../controllers/jobs.controller.js";

const router = Router();

router.get("/", getJobs);
router.get("/:id", getJob);
router.post("/", postJob);

export default router;
