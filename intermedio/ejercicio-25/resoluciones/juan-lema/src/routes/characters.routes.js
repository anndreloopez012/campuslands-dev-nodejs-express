import { Router } from "express";
import { allowMethods } from "../middlewares/allow-methods.js";

function createCharactersRouter({ controller, authenticate }) {
  const router = Router();

  router.route("/").get(controller.list).post(authenticate, controller.create).all(allowMethods("GET", "HEAD", "POST"));
  router.route("/:id").get(controller.get).patch(authenticate, controller.update).delete(authenticate, controller.remove).all(allowMethods("GET", "HEAD", "PATCH", "DELETE"));

  return router;
}

export { createCharactersRouter };
