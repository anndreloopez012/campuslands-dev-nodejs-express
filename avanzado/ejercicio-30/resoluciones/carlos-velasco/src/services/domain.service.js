"use strict";
const crypto = require("node:crypto");
const state = {
  items: [],
  events: [],
  cache: new Map(),
  audit: [],
  jobs: [],
  tokens: new Map(),
  balance: 100,
  bid: 100,
};
let seq = 1;
const fail = (m, s = 400, c = "INVALID_INPUT") => {
  throw Object.assign(new Error(m), { status: s, code: c });
};
const mode = "capstone";
async function execute(op, c) {
  const {
    body = {},
    params = {},
    headers = {},
    query = {},
    res,
    actor = "anonymous",
  } = c;
  switch (mode) {
    case "queue":
      if (op === "add") {
        const j = {
          id: seq++,
          payload: body.payload,
          state: "queued",
          attempts: 0,
        };
        state.jobs.push(j);
        return j;
      }
      if (op === "run") {
        for (const j of state.jobs
          .filter((x) => x.state === "queued")
          .slice(0, 2)) {
          j.state = "running";
          j.attempts++;
          await new Promise((r) => setTimeout(r, 5));
          j.state = "completed";
        }
        return state.jobs;
      }
      return state.jobs;
    case "cache":
      if (op === "put") {
        if (
          !("value" in body) ||
          !Number.isInteger(+body.ttlMs) ||
          +body.ttlMs < 1
        )
          fail("value y ttlMs requeridos");
        state.cache.set(params.key, {
          value: body.value,
          expires: Date.now() + Math.min(+body.ttlMs, 3600000),
        });
        return { stored: true };
      }
      if (op === "delete") return { deleted: state.cache.delete(params.key) };
      {
        const x = state.cache.get(params.key);
        return !x || x.expires < Date.now()
          ? { hit: false }
          : { hit: true, value: x.value };
      }
    case "events":
      if (op === "publish") {
        const e = {
          id: crypto.randomUUID(),
          type: body.type,
          payload: body.payload,
          at: new Date().toISOString(),
        };
        state.events.push(e);
        return e;
      }
      return state.events;
    case "streams":
      res.type("application/x-ndjson");
      for (let i = 1; i <= 50; i++)
        res.write(JSON.stringify({ tick: i, speed: 90 + (i % 20) }) + "\n");
      return res.end();
    case "csv": {
      const lines = String(body.csv || "")
          .trim()
          .split(/\r?\n/),
        h = lines.shift()?.split(",");
      if (!h?.length) fail("CSV vacio");
      return lines.map((x) =>
        Object.fromEntries(
          x.split(",").map((v, i) => [h[i]?.trim(), v.trim()]),
        ),
      );
    }
    case "bulk-import":
      if (op === "import") {
        if (!Array.isArray(body.records) || body.records.length > 500)
          fail("records debe ser lista de maximo 500");
        let rejected = [];
        for (const [i, x] of body.records.entries())
          if (!x.name) rejected.push({ index: i, error: "name requerido" });
          else state.items.push({ id: seq++, ...x });
        return { imported: body.records.length - rejected.length, rejected };
      }
      return state.items;
    case "json-export": {
      const out = {
        version: 1,
        createdAt: new Date().toISOString(),
        items: state.items,
      };
      if (query.download === "true")
        return res.attachment("export.json").json(out);
      return out;
    }
    case "logs":
      if (op === "create") {
        if (!body.destination) fail("destination requerido");
        const x = {
          id: seq++,
          destination: body.destination,
          status: "planned",
        };
        state.items.push(x);
        c.logger?.info(
          { requestId: c.requestId, expeditionId: x.id },
          "expedition.created",
        );
        return x;
      }
      return state.items;
    case "metrics":
      if (op === "metrics")
        return res.type("text/plain").send(`api_requests_total ${seq - 1}\n`);
      return [{ id: 1, name: "Arena", active: true }];
    case "headers":
      return { user: "adventurer", requestId: c.requestId };
    case "sanitize":
      if (op === "create") {
        const message = String(body.message || "")
          .normalize("NFKC")
          .replace(/[<>\u0000-\u001f]/g, "")
          .trim();
        if (!message || message.length > 280) fail("Mensaje invalido");
        const x = { id: seq++, message };
        state.items.push(x);
        return x;
      }
      return state.items;
    case "refresh-tokens":
      if (op === "create") {
        const t = crypto.randomBytes(32).toString("hex");
        state.tokens.set(t, { userId: body.userId, active: true });
        return { refreshToken: t };
      }
      if (op === "revoke") {
        const t = state.tokens.get(body.refreshToken);
        if (t) t.active = false;
        return { revoked: !!t };
      }
      {
        const old = state.tokens.get(body.refreshToken);
        if (!old?.active) fail("Token invalido", 401, "INVALID_TOKEN");
        old.active = false;
        const t = crypto.randomBytes(32).toString("hex");
        state.tokens.set(t, { userId: old.userId, active: true });
        return { refreshToken: t };
      }
    case "rbac":
      if (op === "create" && !["editor", "admin"].includes(actor))
        fail("Forbidden", 403, "FORBIDDEN");
      if (op === "create") {
        const x = { id: seq++, title: body.title };
        state.items.push(x);
        return x;
      }
      return state.items;
    case "audit":
      if (op === "transfer") {
        if (
          !Number.isInteger(body.amount) ||
          body.amount < 1 ||
          body.amount > state.balance
        )
          fail("Transferencia invalida", 409);
        state.balance -= body.amount;
        state.audit.push({
          action: "transfer",
          amount: body.amount,
          actor,
          at: new Date().toISOString(),
        });
        return { balance: state.balance };
      }
      return state.audit;
    case "idempotency": {
      const k = headers["idempotency-key"];
      if (!k) fail("Idempotency-Key requerido");
      const old = state.cache.get(k),
        fp = JSON.stringify(body);
      if (old) {
        if (old.fp !== fp)
          fail(
            "Clave reutilizada con otro payload",
            409,
            "IDEMPOTENCY_CONFLICT",
          );
        return { ...old.value, replayed: true };
      }
      const value = { id: seq++, mount: body.mount };
      state.cache.set(k, { fp, value });
      return { ...value, replayed: false };
    }
    case "mutex":
      if (op === "bid") {
        if (+body.amount < state.bid + 10)
          fail("Oferta insuficiente", 409, "BID_TOO_LOW");
        state.bid = +body.amount;
        return { amount: state.bid, bidder: body.bidder };
      }
      return { amount: state.bid };
    case "webhooks":
      if (op === "register") {
        const h = {
          id: seq++,
          url: body.url,
          secret: crypto.randomBytes(16).toString("hex"),
          deliveries: [],
        };
        state.items.push(h);
        return { id: h.id, url: h.url, secret: h.secret };
      }
      {
        const h = state.items.find((x) => x.id === +params.id);
        if (!h) fail("Webhook no encontrado", 404);
        const d = {
          signature: crypto
            .createHmac("sha256", h.secret)
            .update(JSON.stringify(body))
            .digest("hex"),
          status: 202,
        };
        h.deliveries.push(d);
        return op === "deliveries" ? h.deliveries : d;
      }
    case "scheduler":
      if (op === "run") {
        let j = state.jobs.find((x) => x.name === params.name);
        if (!j) fail("Job no encontrado", 404);
        j.lastRun = new Date().toISOString();
        return j;
      }
      if (!state.jobs.length)
        state.jobs.push({
          name: "world-refresh",
          intervalMs: 60000,
          state: "scheduled",
        });
      return state.jobs;
    case "openapi":
      return op === "spec"
        ? {
            openapi: "3.1.0",
            info: { title: "Maps API", version: "1.0.0" },
            paths: {
              "/maps": {
                get: { responses: { 200: { description: "Map list" } } },
              },
            },
          }
        : [{ id: 1, name: "Forest" }];
    case "integration-tests":
      if (op === "create") {
        if (typeof body.name !== "string" || body.name.trim().length < 3)
          fail("name minimo 3 caracteres");
        const x = { id: seq++, name: body.name.trim() };
        state.items.push(x);
        return x;
      }
      return state.items;
    case "factory-fixtures":
      if (op === "create") {
        const x = {
          id: seq++,
          name: body.name || "Iron sword",
          slot: body.slot || "weapon",
          level: body.level || 1,
        };
        state.items.push(x);
        return x;
      }
      return state.items.length
        ? state.items
        : [{ id: 1, name: "Iron sword", slot: "weapon", level: 1 }];
    case "config":
      return require("../config");
    case "app-server":
      if (op === "create") {
        const x = { id: seq++, name: body.name, status: "planned" };
        state.items.push(x);
        return x;
      }
      return state.items;
    case "deploy":
      return op === "live"
        ? { status: "alive", uptime: process.uptime() }
        : { status: "ready", heapUsed: process.memoryUsage().heapUsed };
    case "capstone":
      if (op === "create") {
        const x = { id: seq++, name: body.name, status: "planned" };
        state.items.push(x);
        state.audit.push({ action: "created", id: x.id, actor });
        return x;
      }
      if (op === "complete") {
        const x = state.items.find((x) => x.id === +params.id);
        if (!x) fail("Expedition not found", 404);
        if (x.status !== "planned") fail("Invalid state transition", 409);
        x.status = "completed";
        state.audit.push({ action: "completed", id: x.id, actor });
        return x;
      }
      return op === "audit" ? state.audit : state.items;
  }
}
module.exports = { execute };
