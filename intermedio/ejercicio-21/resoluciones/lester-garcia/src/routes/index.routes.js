import { Router } from "express";
import renderJobsRouter from "./renderJobs.routes.js";

const router = Router();

router.use("/renders", renderJobsRouter);

export default router;
