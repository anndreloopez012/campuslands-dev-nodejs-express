import { getCanvases, postCanvas, postLayer } from "../controllers/canvases.controller.js";

function canvasesRoutes(app) {
    app.get("/canvases", getCanvases);
    app.post("/canvases", postCanvas);
    app.post("/canvases/:id/layers", postLayer);
}

export { canvasesRoutes };
