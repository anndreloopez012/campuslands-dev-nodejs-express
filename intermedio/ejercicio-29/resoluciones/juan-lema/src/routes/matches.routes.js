import { Router } from "express";

function createMatchesRouter({ controller }) {
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.post("/", controller.create);
  router.patch("/:id/start", controller.start);
  router.patch("/:id/score", controller.score);
  router.patch("/:id/finish", controller.finish);

  return router;
}

export { createMatchesRouter };
