import { Router } from "express";
import { authorize } from "../middlewares/authorize.js";

function createMotorcyclesRouter({ controller, authenticate }) {
  const router = Router();

  router.use(authenticate);
  router.get("/", authorize("motorcycles:read"), controller.list);
  router.get("/:id", authorize("motorcycles:read"), controller.get);
  router.post("/", authorize("motorcycles:create"), controller.create);

  return router;
}

export { createMotorcyclesRouter };
