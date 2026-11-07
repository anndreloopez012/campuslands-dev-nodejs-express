"use strict";
const err = (message, status = 400, code = "INVALID_INPUT") =>
  Object.assign(new Error(message), { status, code });
const stock = new Map([
  ["potion", { quantity: 8, price: 10 }],
  ["ether", { quantity: 5, price: 15 }],
]);
let gold = 100,
  id = 1;
exports.inventory = () => ({
  gold,
  items: [...stock].map(([sku, x]) => ({ sku, ...x })),
});
exports.purchase = ({ body }) => {
  if (!Array.isArray(body.items) || !body.items.length)
    throw err("items es requerido");
  const need = new Map();
  for (const x of body.items) {
    if (!Number.isInteger(x.quantity) || x.quantity < 1)
      throw err("quantity invalida");
    need.set(x.sku, (need.get(x.sku) || 0) + x.quantity);
  }
  let total = 0;
  for (const [sku, q] of need) {
    const x = stock.get(sku);
    if (!x) throw err("SKU inexistente", 404);
    if (x.quantity < q) throw err("Stock insuficiente", 409);
    total += x.price * q;
  }
  if (total > gold) throw err("Oro insuficiente", 409);
  for (const [sku, q] of need) stock.get(sku).quantity -= q;
  gold -= total;
  return { id: id++, items: [...need], total, goldRemaining: gold };
};
