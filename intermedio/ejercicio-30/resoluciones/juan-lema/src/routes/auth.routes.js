import { Router } from "express";

function createAuthRouter({ controller, authenticate }) {
  const router = Router();

  router.post("/login", controller.login);
  router.get("/me", authenticate, controller.me);

  return router;
}

export { createAuthRouter };
