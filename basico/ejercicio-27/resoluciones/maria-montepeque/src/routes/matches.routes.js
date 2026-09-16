import * as controller from "../controllers/matches.controller.js";

function matchesRoutes(router) {
    router.get("/teams", controller.getTeams);
    router.get("/matches", controller.getMatches);
    router.post("/matches", controller.postMatch);
    router.get("/logs", controller.getLogs);
    router.get("/crash", controller.crash);
}

export { matchesRoutes };
