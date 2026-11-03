import * as controller from "../controllers/league.controller.js";

function leagueRoutes(router) {
    router.get("/modalities", controller.getModalities);
    router.get("/teams", controller.getTeams);
    router.get("/teams/:id", controller.getTeam);
    router.get("/matches", controller.getMatches);
    router.post("/matches", controller.postMatch);
    router.get("/standings/:modality", controller.getStandings);
}

export { leagueRoutes };
