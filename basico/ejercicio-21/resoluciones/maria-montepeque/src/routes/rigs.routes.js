import { createRouter } from "../core/router.js";
import { getRigs, getRig } from "../controllers/rigs.controller.js";

const rigsRouter = createRouter();

rigsRouter.get("", getRigs);
rigsRouter.get("/:id", getRig);

export { rigsRouter };
