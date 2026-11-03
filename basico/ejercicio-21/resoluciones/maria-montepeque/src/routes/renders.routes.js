import { createRouter } from "../core/router.js";
import { getRenders, getRender, postRender } from "../controllers/renders.controller.js";

const rendersRouter = createRouter();

rendersRouter.get("", getRenders);
rendersRouter.post("", postRender);
rendersRouter.get("/:id", getRender);

export { rendersRouter };
