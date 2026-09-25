import * as controller from "../controllers/electrodes.controller.js";

function electrodesRoutes(router) {
    router.get("/electrodes", controller.getElectrodes);
    router.post("/electrodes", controller.postElectrode);
    router.get("/electrodes/:id", controller.getElectrode);
    router.patch("/electrodes/:id/stock", controller.patchStock);
    router.delete("/electrodes/:id", controller.deleteElectrode);
    router.get("/stats", controller.getStats);
    router.post("/reset", controller.postReset);
}

export { electrodesRoutes };
