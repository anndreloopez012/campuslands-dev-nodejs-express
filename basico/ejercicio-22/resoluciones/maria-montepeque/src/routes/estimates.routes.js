import { postEstimate, getScale, getCatalog } from "../controllers/estimates.controller.js";

function estimatesRoutes(router) {
    router.post("/estimates", postEstimate);
    router.get("/scale", getScale);
    router.get("/materials", getCatalog);
}

export { estimatesRoutes };
