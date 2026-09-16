import * as controller from "../controllers/arena.controller.js";

function arenaRoutes(router) {
    router.get("/status-codes", controller.getStatusCodes);
    router.get("/players/me", controller.getMe);
    router.post("/queue", controller.postQueue);
    router.get("/queue/:ticketId", controller.getQueueTicket);
    router.delete("/queue/:ticketId", controller.deleteQueueTicket);
    router.post("/legacy/queue", controller.legacyQueue);
    router.get("/tournaments/:id", controller.getTournament);
    router.post("/tournaments/:id/register", controller.postRegister);
    router.get("/replays", controller.getReplays);
    router.post("/maintenance", controller.postMaintenance);
    router.get("/crash", controller.crash);
}

export { arenaRoutes };
