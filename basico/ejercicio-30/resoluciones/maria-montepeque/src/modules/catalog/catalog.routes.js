import { createRouter } from "../../core/router.js";
import { reply } from "../../core/reply.js";
import { HttpError } from "../../core/errors.js";

function catalogRoutes(store, { laborRate }) {
    const services = store.collection("services");
    const router = createRouter();

    const priced = (s) => ({ ...s, laborCost: s.hours * laborRate, total: s.hours * laborRate + s.partsCost });

    router.get("/services", (req, res) => reply.cached(req, res, services.all().map(priced), { laborRate }));
    router.get("/services/:code", (req, res) => {
        const service = services.find((s) => s.code === req.params.code.toUpperCase());
        if (!service) throw HttpError.notFound(`No existe el servicio ${req.params.code}`);
        reply.cached(req, res, priced(service));
    });

    return router;
}

export { catalogRoutes };
