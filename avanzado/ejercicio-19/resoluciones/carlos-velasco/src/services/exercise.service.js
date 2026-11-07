"use strict";
const crypto = require("node:crypto");
const items = [];
let nextId = 1;
const cache = new Map();
function list() {
  return items.map((x) => ({ ...x }));
}
function create({ body = {}, headers = {}, params = {} }) {
  const topic = "auditoria de acciones";
  if (topic.includes("cache")) {
    const key = params.key;
    if (body.ttlMs)
      cache.set(key, {
        value: body.value,
        expires: Date.now() + Math.min(Number(body.ttlMs), 3600000),
      });
    const v = cache.get(key);
    if (!v || v.expires < Date.now()) return { hit: false };
    return { hit: true, value: v.value };
  }
  if (topic.includes("CSV")) {
    const lines = String(body.csv || "")
      .trim()
      .split(/\r?\n/);
    const h = lines.shift()?.split(",");
    if (!h?.length)
      throw Object.assign(new Error("CSV requerido"), {
        status: 400,
        code: "INVALID_CSV",
      });
    return lines.map((line) =>
      Object.fromEntries(line.split(",").map((v, i) => [h[i], v.trim()])),
    );
  }
  if (topic.includes("sanitizacion")) {
    body = {
      ...body,
      message: String(body.message || "")
        .normalize("NFKC")
        .replace(/[<>\u0000-\u001f]/g, "")
        .trim(),
    };
    if (!body.message || body.message.length > 280)
      throw Object.assign(new Error("Entrada invalida"), {
        status: 400,
        code: "INVALID_INPUT",
      });
  }
  if (topic.includes("idempotencia")) {
    const k = headers["idempotency-key"];
    if (!k)
      throw Object.assign(new Error("Idempotency-Key requerido"), {
        status: 400,
        code: "KEY_REQUIRED",
      });
    const old = cache.get(k);
    if (old) return { ...old, replayed: true };
  }
  if (topic.includes("concurrencia")) {
    const current = items[0]?.amount || 100;
    if (Number(body.amount) <= current)
      throw Object.assign(new Error("Oferta debe ser mayor"), {
        status: 409,
        code: "BID_TOO_LOW",
      });
  }
  if (
    topic.includes("multirol") &&
    !["editor", "admin"].includes(headers["x-role"])
  )
    throw Object.assign(new Error("Acceso denegado"), {
      status: 403,
      code: "FORBIDDEN",
    });
  const item = { id: nextId++, ...body, createdAt: new Date().toISOString() };
  items.push(item);
  if (topic.includes("idempotencia"))
    cache.set(headers["idempotency-key"], item);
  return item;
}
function metadata() {
  return {
    topic: "auditoria de acciones",
    count: items.length,
    generatedAt: new Date().toISOString(),
  };
}
module.exports = { list, create, metadata };
