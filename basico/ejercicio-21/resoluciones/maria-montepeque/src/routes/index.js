import { createRouter } from "../core/router.js";
import { json } from "../core/http.js";
import { rigsRouter } from "./rigs.routes.js";
import { rendersRouter } from "./renders.routes.js";

const apiRouter = createRouter();

apiRouter.get("/health", (req, res) => {
    json(res, 200, { ok: true, message: "API de animacion 3D activa" });
});

apiRouter.use("/rigs", rigsRouter);
apiRouter.use("/renders", rendersRouter);

export { apiRouter };
