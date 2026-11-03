import { createRouter } from "../../core/router.js";
import { reply } from "../../core/reply.js";

function motorcyclesRoutes(service, workOrders) {
    const router = createRouter();

    router.get("", (req, res) => reply.cached(req, res, service.list(req.query)));
    router.get("/:id", (req, res) => reply.cached(req, res, service.get(req.params.id)));
    router.post("", (req, res) => {
        const motorcycle = service.create(req.body);
        reply.created(req, res, motorcycle, `/api/motorcycles/${motorcycle.id}`);
    });
    router.patch("/:id", (req, res) => reply.ok(req, res, service.update(req.params.id, req.body)));
    router.delete("/:id", (req, res) => {
        service.remove(req.params.id, workOrders);
        reply.noContent(req, res);
    });

    return router;
}

export { motorcyclesRoutes };
