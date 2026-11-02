import { trucks } from "../data/trucks.js";

const orders = [];

function listTrucks({ zone } = {}) {
    return zone ? trucks.filter((truck) => truck.zone === zone) : trucks;
}

function findTruck(id) {
    return trucks.find((truck) => truck.id === Number(id)) ?? null;
}

function createOrder({ truckId, item, quantity }) {
    const errors = [];
    const truck = findTruck(truckId);

    if (!truck) errors.push("truckId no corresponde a un food truck existente");
    if (truck && !truck.open) errors.push("el food truck esta cerrado");
    if (!item || typeof item !== "string" || !item.trim()) errors.push("item es obligatorio");
    if (!Number.isInteger(quantity) || quantity <= 0) errors.push("quantity debe ser un entero mayor a 0");

    if (errors.length > 0) return { errors };

    const order = { id: orders.length + 1, truck: truck.name, item: item.trim(), quantity };
    orders.push(order);
    return { order };
}

export { listTrucks, findTruck, createOrder };