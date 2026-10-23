import * as controller from "../controllers/heroes.controller.js";

function heroesRoutes(router) {
    router.get("/heroes", controller.getHeroes);
    router.post("/heroes", controller.postHero);
    router.get("/heroes/:id", controller.getHero);
    router.post("/heroes/:id/level-up", controller.postLevelUp);
    router.delete("/heroes/:id", controller.deleteHero);
}

export { heroesRoutes };
