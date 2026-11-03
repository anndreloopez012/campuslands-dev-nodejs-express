import * as controller from "../controllers/reagents.controller.js";

function reagentsRoutes(router) {
    router.get("/reagents", controller.index);
    router.post("/reagents", controller.store);
    router.get("/reagents/:id", controller.show);
    router.put("/reagents/:id", controller.update);
    router.patch("/reagents/:id", controller.modify);
    router.delete("/reagents/:id", controller.destroy);
}

export { reagentsRoutes };
