"use strict";
const inventory = new Map([
  ["health", { sku: "health", stock: 8, price: 12 }],
  ["mana", { sku: "mana", stock: 5, price: 18 }],
]);
let gold = 100;
let nextId = 1;
function inventoryList() {
  return [...inventory.values()].map((x) => ({ ...x }));
}
function purchase({ body }) {
  const lines = body?.items;
  if (!Array.isArray(lines) || !lines.length)
    throw Object.assign(new Error("items debe ser una lista no vacia"), {
      status: 400,
      code: "INVALID_ITEMS",
    });
  const totals = new Map();
  for (const line of lines) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1)
      throw Object.assign(new Error("Cantidad invalida"), {
        status: 400,
        code: "INVALID_QUANTITY",
      });
    totals.set(line.sku, (totals.get(line.sku) || 0) + line.quantity);
  }
  let total = 0;
  for (const [sku, qty] of totals) {
    const item = inventory.get(sku);
    if (!item)
      throw Object.assign(new Error(`SKU ${sku} no existe`), {
        status: 404,
        code: "SKU_NOT_FOUND",
      });
    if (item.stock < qty)
      throw Object.assign(new Error(`Stock insuficiente para ${sku}`), {
        status: 409,
        code: "INSUFFICIENT_STOCK",
      });
    total += item.price * qty;
  }
  if (gold < total)
    throw Object.assign(new Error("Oro insuficiente"), {
      status: 409,
      code: "INSUFFICIENT_GOLD",
    });
  // Commit: las mutaciones ocurren solo despues de validar todas las precondiciones.
  for (const [sku, qty] of totals) inventory.get(sku).stock -= qty;
  gold -= total;
  return {
    id: nextId++,
    items: [...totals].map(([sku, quantity]) => ({ sku, quantity })),
    total,
    goldRemaining: gold,
  };
}
module.exports = { inventoryList, purchase };
