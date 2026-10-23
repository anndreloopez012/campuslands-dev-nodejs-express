import { Router } from "express";

function createMatchesRouter({ controller }) {
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.post("/", controller.create);

  return router;
}

export { createMatchesRouter };
