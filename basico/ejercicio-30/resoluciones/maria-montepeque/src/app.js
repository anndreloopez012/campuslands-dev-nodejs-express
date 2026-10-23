import { createRouter } from "./core/router.js";
import { reply } from "./core/reply.js";
import { HttpError } from "./core/errors.js";
import { requestContext } from "./middlewares/request-context.js";
import { jsonBody } from "./middlewares/json-body.js";
import { createMotorcyclesService } from "./modules/motorcycles/motorcycles.service.js";
import { motorcyclesRoutes } from "./modules/motorcycles/motorcycles.routes.js";
import { createWorkOrdersService } from "./modules/work-orders/work-orders.service.js";
import { workOrdersRoutes } from "./modules/work-orders/work-orders.routes.js";
import { catalogRoutes } from "./modules/catalog/catalog.routes.js";

function createApp({ config, store, logger }) {
    const motorcycles = createMotorcyclesService(store);
    const workOrders = createWorkOrdersService(store, { laborRate: config.LABOR_RATE_PER_HOUR, log: logger.child({ module: "work-orders" }) });

    const api = createRouter();
    api.use("/motorcycles", motorcyclesRoutes(motorcycles, store.collection("workOrders")));
    api.use("/work-orders", workOrdersRoutes(workOrders));
    api.use("/catalog", catalogRoutes(store, { laborRate: config.LABOR_RATE_PER_HOUR }));

    const root = createRouter();
    root.get("/health", (req, res) => reply.ok(req, res, { env: config.env, uptime: Math.round(process.uptime()) }));
    root.get("/", (req, res) => reply.cached(req, res, api.flatten("/api").map((r) => `${r.method} ${r.path}`)));
    root.use("/api", api);

    if (config.FEATURE_DEBUG_ROUTES) {
        root.get("/debug/config", (req, res) => reply.ok(req, res, config));
    }

    const attachContext = requestContext(logger);
    const parseBody = jsonBody({ limitKb: config.BODY_LIMIT_KB });

    return async function handleRequest(req, res) {
        attachContext(req, res);

        try {
            const { handler, allowed } = root.resolve(req);
            if (!handler) {
                if (allowed.length > 0) throw new HttpError(405, `${req.method} no permitido`, { details: { allowed }, headers: { Allow: allowed.join(", ") } });
                throw HttpError.notFound(`La ruta ${req.url} no existe`);
            }

            await parseBody(req);
            await handler(req, res);
        } catch (error) {
            const status = error instanceof HttpError ? error.status : 500;
            if (status === 500) req.log.error(error.message, { stack: error.stack?.split("\n")[1]?.trim() });
            reply.problem(req, res, status, status === 500 ? "Error interno del servidor" : error.message, error.details, error.headers);
        }
    };
}

export { createApp };
