import { Router } from "express";
import { allowMethods } from "../middlewares/allow-methods.js";

function createAuthRouter({ controller, authenticate }) {
  const router = Router();

  router.use((req, res, next) => {
    res.set("Cache-Control", "no-store");
    next();
  });
  router.route("/login").post(controller.login).all(allowMethods("POST"));
  router.route("/me").get(authenticate, controller.me).all(allowMethods("GET", "HEAD"));
  router.route("/logout").post(authenticate, controller.logout).all(allowMethods("POST"));

  return router;
}

export { createAuthRouter };
