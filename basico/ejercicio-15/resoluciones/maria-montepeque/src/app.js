import { createRouter } from "./router.js";
import { sendJson, readJson } from "./http.js";
import { listTrucks, findTruck, createOrder } from "./services/trucks.service.js";

const router = createRouter();

router.add("GET", "/health", (req, res) => {
    sendJson(res, 200, { ok: true, message: "API de food trucks activa" });
});

router.add("GET", "/trucks", (req, res, { query }) => {
    const data = listTrucks({ zone: query.get("zone") });
    sendJson(res, 200, { ok: true, count: data.length, data });
});

router.add("GET", "/trucks/:id", (req, res, { params }) => {
    const truck = findTruck(params.id);
    if (!truck) return sendJson(res, 404, { ok: false, message: `No existe el food truck ${params.id}` });
    sendJson(res, 200, { ok: true, data: truck });
});

router.add("POST", "/orders", async (req, res) => {
    const body = await readJson(req);
    const { errors, order } = createOrder(body);
    if (errors) return sendJson(res, 400, { ok: false, errors });
    sendJson(res, 201, { ok: true, data: order });
});

async function handleRequest(req, res) {
    const { pathname, searchParams } = new URL(req.url, `http://${req.headers.host}`);
    const { handler, params, pathMatched } = router.match(req.method, pathname);

    if (!handler) {
        const status = pathMatched ? 405 : 404;
        return sendJson(res, status, { ok: false, message: pathMatched ? "Metodo no permitido" : "Ruta no encontrada" });
    }

    try {
        await handler(req, res, { params, query: searchParams });
    } catch (error) {
        sendJson(res, 400, { ok: false, message: error.message });
    }
}

export { handleRequest };