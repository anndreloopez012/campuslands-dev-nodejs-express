import { Router } from "express";

function createDropsRouter({ controller }) {
  const router = Router();

  router.get("/", controller.list);
  router.get("/:id", controller.get);
  router.post("/", controller.create);
  router.patch("/:id/claim", controller.claim);
  router.delete("/:id", controller.remove);

  return router;
}

export { createDropsRouter };
