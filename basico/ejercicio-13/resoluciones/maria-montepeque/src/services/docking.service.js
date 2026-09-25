import { AppError } from "../errors/app-error.js";

const BAY_CAPACITY_TONS = 500;
const occupiedBays = { A: 120, B: 480, C: 0 };

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function requestDocking({ ship, bay, cargo }) {
    if (!ship || typeof ship !== "string" || !ship.trim()) {
        throw new AppError("El nombre de la nave es obligatorio", "INVALID_SHIP");
    }

    if (!(bay in occupiedBays)) {
        throw new AppError("La bahia no existe", "UNKNOWN_BAY", { bay, available: Object.keys(occupiedBays) });
    }

    const tons = Number(cargo);
    if (!Number.isFinite(tons) || tons < 0) {
        throw new AppError("La carga debe ser un numero mayor o igual a 0", "INVALID_CARGO", { cargo });
    }

    await delay(300);

    const free = BAY_CAPACITY_TONS - occupiedBays[bay];
    if (tons > free) {
        throw new AppError("La bahia no tiene capacidad para esa carga", "BAY_FULL", { bay, free, requested: tons });
    }

    try {
        return await assignAirlock(ship.trim(), bay, tons);
    } catch (error) {
        throw new AppError("Fallo al asignar la esclusa", "AIRLOCK_FAILURE", {}, { cause: error });
    }
}

async function assignAirlock(ship, bay, tons) {
    await delay(200);

    if (ship.toLowerCase() === "nostromo") {
        throw new Error("Esclusa bloqueada por cuarentena");
    }

    return { ship, bay, tons, airlock: `${bay}-${String(tons).padStart(3, "0")}` };
}

export { requestDocking };