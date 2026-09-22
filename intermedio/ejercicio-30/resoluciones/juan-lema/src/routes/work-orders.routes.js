import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";

function createWorkOrdersRouter({ controller, authenticate }) {
  const router = Router();

  router.use(authenticate);
  router.get("/", authorize("workorders:read"), controller.list);
  router.get("/:id", authorize("workorders:read"), controller.get);
  router.post("/", authorize("workorders:create"), controller.create);
  router.patch("/:id/status", authorize("workorders:update"), controller.advance);
  router.delete("/:id", authorize("workorders:delete"), controller.remove);

  return router;
}

export { createWorkOrdersRouter };
