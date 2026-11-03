import { createMemoryStore } from "../core/memory-store.js";
import { electrodesSeed } from "../data/electrodes.seed.js";

const PROCESSES = ["SMAW", "GMAW", "GTAW", "FCAW"];
const store = createMemoryStore(electrodesSeed);

function validateElectrode({ code, diameterMm, process, stock, minStock }) {
    const errors = [];

    if (typeof code !== "string" || !/^E[R]?\d{2,4}[A-Z0-9-]*$/i.test(code.trim())) errors.push("code debe ser una clasificacion AWS, ejemplo E7018 o ER70S-6");
    if (typeof diameterMm !== "number" || diameterMm <= 0) errors.push("diameterMm debe ser un numero mayor a 0");
    if (!PROCESSES.includes(process)) errors.push(`process debe ser uno de: ${PROCESSES.join(", ")}`);
    if (!Number.isInteger(stock) || stock < 0) errors.push("stock debe ser un entero mayor o igual a 0");
    if (!Number.isInteger(minStock) || minStock < 0) errors.push("minStock debe ser un entero mayor o igual a 0");

    return errors;
}

const withAlert = (electrode) => ({ ...electrode, lowStock: electrode.stock < electrode.minStock });

function listElectrodes({ process, lowStock } = {}) {
    return store
        .findAll((item) => !process || item.process === process.toUpperCase())
        .map(withAlert)
        .filter((item) => lowStock !== "true" || item.lowStock);
}

function getElectrode(id) {
    const electrode = store.findById(id);
    return electrode ? withAlert(electrode) : null;
}

function createElectrode(payload) {
    const errors = validateElectrode(payload);
    if (errors.length > 0) return { errors };

    const duplicated = store.findAll((item) => item.code === payload.code.toUpperCase() && item.diameterMm === payload.diameterMm);
    if (duplicated.length > 0) return { conflict: true };

    const { code, diameterMm, process, stock, minStock } = payload;
    return { electrode: withAlert(store.insert({ code: code.toUpperCase(), diameterMm, process, stock, minStock })) };
}

function adjustStock(id, delta) {
    const electrode = store.findById(id);
    if (!electrode) return { notFound: true };
    if (!Number.isInteger(delta) || delta === 0) return { errors: ["delta debe ser un entero distinto de 0"] };
    if (electrode.stock + delta < 0) return { errors: [`stock insuficiente: hay ${electrode.stock} y se intentan retirar ${-delta}`] };

    return { electrode: withAlert(store.update(id, { stock: electrode.stock + delta })) };
}

function deleteElectrode(id) {
    return store.remove(id);
}

function getStats() {
    const all = store.findAll();
    return {
        items: all.length,
        totalStock: all.reduce((sum, item) => sum + item.stock, 0),
        lowStockItems: all.filter((item) => item.stock < item.minStock).length,
        uptimeSeconds: Math.round(process.uptime()),
        heapUsedMb: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 10) / 10,
    };
}

function resetElectrodes() {
    store.reset();
    return store.size();
}

export { listElectrodes, getElectrode, createElectrode, adjustStock, deleteElectrode, getStats, resetElectrodes };
