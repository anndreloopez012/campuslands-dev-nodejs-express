import { createRouter } from "../../core/router.js";
import { reply } from "../../core/reply.js";

function workOrdersRoutes(service) {
    const router = createRouter();

    router.get("", (req, res) => reply.ok(req, res, service.list(req.query)));
    router.get("/transitions", (req, res) => reply.cached(req, res, service.transitions));
    router.get("/:id", (req, res) => reply.ok(req, res, service.get(req.params.id)));
    router.get("/:id/invoice", (req, res) => reply.ok(req, res, service.invoice(req.params.id)));
    router.post("", (req, res) => {
        const order = service.create(req.body);
        reply.created(req, res, order, `/api/work-orders/${order.id}`);
    });
    router.patch("/:id/status", (req, res) => reply.ok(req, res, service.changeStatus(req.params.id, req.body)));

    return router;
}

export { workOrdersRoutes };
