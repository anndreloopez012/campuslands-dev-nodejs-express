"use strict";
const stock = new Map([
  ["potion", { quantity: 8, price: 10 }],
  ["ether", { quantity: 5, price: 15 }],
]);
let gold = 100;
function inventory() {
  return { gold, items: [...stock].map(([sku, x]) => ({ sku, ...x })) };
}
function purchase({ body }) {
  if (!Array.isArray(body?.items) || !body.items.length)
    throw Object.assign(new Error("items requerido"), {
      status: 400,
      code: "INVALID_ITEMS",
    });
  const amounts = new Map();
  for (const line of body.items) {
    if (!Number.isInteger(line.quantity) || line.quantity < 1)
      throw Object.assign(new Error("Cantidad invalida"), {
        status: 400,
        code: "INVALID_QUANTITY",
      });
    amounts.set(line.sku, (amounts.get(line.sku) || 0) + line.quantity);
  }
  let total = 0;
  for (const [sku, q] of amounts) {
    const item = stock.get(sku);
    if (!item)
      throw Object.assign(new Error(`SKU ${sku} inexistente`), {
        status: 404,
        code: "SKU_NOT_FOUND",
      });
    if (item.quantity < q)
      throw Object.assign(new Error(`Stock insuficiente para ${sku}`), {
        status: 409,
        code: "INSUFFICIENT_STOCK",
      });
    total += item.price * q;
  }
  if (gold < total)
    throw Object.assign(new Error("Oro insuficiente"), {
      status: 409,
      code: "INSUFFICIENT_GOLD",
    });
  for (const [sku, q] of amounts) stock.get(sku).quantity -= q;
  gold -= total;
  return {
    items: [...amounts].map(([sku, quantity]) => ({ sku, quantity })),
    total,
    goldRemaining: gold,
  };
}
module.exports = { inventory, purchase };
