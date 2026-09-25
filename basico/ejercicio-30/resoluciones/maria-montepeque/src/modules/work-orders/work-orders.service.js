import { HttpError } from "../../core/errors.js";
import { validate } from "../../core/validate.js";

const TRANSITIONS = {
    received: ["diagnosing", "cancelled"],
    diagnosing: ["in_repair", "cancelled"],
    in_repair: ["ready"],
    ready: ["delivered"],
    delivered: [],
    cancelled: [],
};

const createSchema = {
    motorcycleId: { type: "integer", min: 1 },
    serviceCodes: { type: "array" },
    complaint: { type: "string" },
};

function createWorkOrdersService(store, { laborRate, log }) {
    const workOrders = store.collection("workOrders");
    const services = store.collection("services");
    const motorcycles = store.collection("motorcycles");

    function getOrFail(id) {
        const order = workOrders.byId(id);
        if (!order) throw HttpError.notFound(`No existe la orden ${id}`);
        return order;
    }

    function resolveServices(codes) {
        const unknown = codes.filter((code) => !services.find((s) => s.code === code));
        if (unknown.length > 0) throw HttpError.unprocessable("Servicios desconocidos", unknown.map((code) => ({ field: "serviceCodes", message: `${code} no existe en el catalogo` })));
        return codes.map((code) => services.find((s) => s.code === code));
    }

    return {
        transitions: TRANSITIONS,
        list: ({ status } = {}) => workOrders.all().filter((wo) => !status || wo.status === status),
        get: getOrFail,

        create(input) {
            const data = validate(createSchema, input);
            if (!motorcycles.byId(data.motorcycleId)) throw HttpError.notFound(`No existe la moto ${data.motorcycleId}`);
            resolveServices(data.serviceCodes);

            const open = workOrders.find((wo) => wo.motorcycleId === data.motorcycleId && !["delivered", "cancelled"].includes(wo.status));
            if (open) throw HttpError.conflict(`La moto ya tiene la orden ${open.id} abierta`);

            const order = workOrders.insert({ ...data, status: "received", history: [{ status: "received", at: new Date().toISOString() }] });
            log.info("orden creada", { orderId: order.id, motorcycleId: order.motorcycleId });
            return order;
        },

        changeStatus(id, input) {
            const order = getOrFail(id);
            const { status } = validate({ status: { type: "string", enum: Object.keys(TRANSITIONS) } }, input);

            if (!TRANSITIONS[order.status].includes(status)) {
                throw HttpError.conflict(`No se puede pasar de ${order.status} a ${status}; permitidos: ${TRANSITIONS[order.status].join(", ") || "ninguno"}`);
            }

            const updated = workOrders.update(id, { status, history: [...order.history, { status, at: new Date().toISOString() }] });
            log.info("orden actualizada", { orderId: updated.id, from: order.status, to: status });
            return updated;
        },

        invoice(id) {
            const order = getOrFail(id);
            if (!["ready", "delivered"].includes(order.status)) throw HttpError.conflict("La factura solo esta disponible cuando la orden esta lista o entregada");

            const lines = resolveServices(order.serviceCodes).map((s) => ({ code: s.code, name: s.name, labor: s.hours * laborRate, parts: s.partsCost, total: s.hours * laborRate + s.partsCost }));
            const subtotal = lines.reduce((sum, line) => sum + line.total, 0);
            const tax = Math.round(subtotal * 0.19);

            return { orderId: order.id, motorcycle: motorcycles.byId(order.motorcycleId)?.plate, laborRate, lines, subtotal, tax, total: subtotal + tax };
        },
    };
}

export { createWorkOrdersService, TRANSITIONS };
