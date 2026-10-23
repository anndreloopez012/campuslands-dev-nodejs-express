import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { createMatchesService, MAPS } from "../src/services/matches.service.js";
import { errorHandler } from "../src/middlewares/error-handler.js";
import { startApp } from "../test-support/client.js";

let client;
afterEach(() => client?.close());

function fakeRankingClient(ranksById = {}) {
  return {
    getRank: async (playerId) => {
      if (!(playerId in ranksById)) return null;
      const value = ranksById[playerId];
      if (value instanceof Error) throw value;
      return value;
    },
  };
}

async function boot(ranksById) {
  const matches = createMatchesService({ rankingClient: fakeRankingClient(ranksById), now: () => new Date("2026-01-15T10:00:00.000Z") });
  client = await startApp(createApp({ matches }));
  return client;
}

describe("POST /matches (la API de ranking real queda mockeada, nunca sale a la red)", () => {
  it("201: crea la partida, con Location y el promedio calculado a partir del mock", async () => {
    const c = await boot({ 1: 1200, 2: 1800 });
    const response = await c.request("POST", "/matches", { json: { mapName: MAPS[0], players: [1, 2] } });

    assert.equal(response.status, 201);
    assert.equal(response.headers.get("location"), "/matches/1");
    assert.deepEqual(response.body.data, {
      id: 1,
      mapName: MAPS[0],
      players: [{ playerId: 1, rank: 1200 }, { playerId: 2, rank: 1800 }],
      averageRank: 1500,
      tier: "oro",
      createdAt: "2026-01-15T10:00:00.000Z",
    });
  });

  it("la partida creada aparece luego en GET /matches y GET /matches/:id", async () => {
    const c = await boot({ 1: 1000, 2: 1000 });
    const created = (await c.request("POST", "/matches", { json: { mapName: MAPS[0], players: [1, 2] } })).body.data;

    assert.deepEqual((await c.request("GET", `/matches/${created.id}`)).body.data, created);
    assert.deepEqual((await c.request("GET", "/matches")).body.data, [created]);
  });

  it("400 INVALID_BODY si el mapa no existe, y no llega a consultar el ranking", async () => {
    const c = await boot({ 1: 1000, 2: 1000 });
    const response = await c.request("POST", "/matches", { json: { mapName: "Base Lunar", players: [1, 2] } });

    assert.equal(response.status, 400);
    assert.equal(response.body.code, "INVALID_BODY");
    assert.deepEqual((await c.request("GET", "/matches")).body.data, []);
  });

  it("400 INVALID_BODY con menos de 2 jugadores o ids repetidos", async () => {
    const c = await boot({ 1: 1000 });

    assert.equal((await c.request("POST", "/matches", { json: { mapName: MAPS[0], players: [1] } })).status, 400);
    assert.equal((await c.request("POST", "/matches", { json: { mapName: MAPS[0], players: [1, 1] } })).status, 400);
  });

  it("400 si el cuerpo no es JSON valido", async () => {
    const c = await boot({});
    const response = await c.request("POST", "/matches", { body: "{oops", headers: { "Content-Type": "application/json" } });

    assert.equal(response.status, 400);
    assert.equal(response.body.code, "INVALID_JSON");
  });

  describe("502 cuando la dependencia externa (ranking) falla: se simula sin tocar la red real", () => {
    it("un jugador cuyo rank no se puede consultar hace fallar toda la creacion con 502", async () => {
      const c = await boot({ 1: new Error("ECONNRESET"), 2: 1500 });
      const response = await c.request("POST", "/matches", { json: { mapName: MAPS[0], players: [1, 2] } });

      assert.equal(response.status, 502);
      assert.deepEqual(response.body, { ok: false, code: "RANKING_UNAVAILABLE", message: "No se pudo consultar el ranking de los jugadores" });
    });

    it("el error de la dependencia externa no se filtra al cliente", async () => {
      const c = await boot({ 1: new Error("credenciales invalidas de la API interna: sk_live_12345") });
      const response = await c.request("POST", "/matches", { json: { mapName: MAPS[0], players: [1, 2] } });

      assert.ok(!response.text.includes("sk_live_12345"));
    });

    it("tras el fallo la API sigue funcionando (no crea nada a medias)", async () => {
      const c = await boot({ 1: new Error("caida"), 2: 1500 });
      await c.request("POST", "/matches", { json: { mapName: MAPS[0], players: [1, 2] } });

      assert.equal((await c.request("GET", "/health")).status, 200);
      assert.deepEqual((await c.request("GET", "/matches")).body.data, []);
    });
  });
});

describe("GET /matches y GET /matches/:id", () => {
  it("200 con lista vacia si no hay partidas", async () => {
    const c = await boot({});

    assert.deepEqual((await c.request("GET", "/matches")).body.data, []);
  });

  it("404 NOT_FOUND si la partida no existe", async () => {
    const c = await boot({});
    const response = await c.request("GET", "/matches/99");

    assert.equal(response.status, 404);
    assert.equal(response.body.code, "NOT_FOUND");
  });

  it("400 INVALID_ID si el id no es un entero positivo", async () => {
    const c = await boot({});

    assert.equal((await c.request("GET", "/matches/abc")).status, 400);
  });
});

describe("rutas desconocidas", () => {
  it("404 ROUTE_NOT_FOUND", async () => {
    const c = await boot({});
    const response = await c.request("GET", "/nada");

    assert.equal(response.status, 404);
    assert.equal(response.body.code, "ROUTE_NOT_FOUND");
  });
});

describe("un fallo interno inesperado (no de la dependencia externa) responde 500 generico", () => {
  it("500, sin filtrar detalles y registrado en consola", async (t) => {
    const log = t.mock.method(console, "error", () => {});
    const failure = new Error("bug interno: null is not an object");
    client = await startApp(createApp({ matches: { list: () => { throw failure; }, create: async () => {}, getById: () => {} } }));

    const response = await client.request("GET", "/matches");

    assert.equal(response.status, 500);
    assert.deepEqual(response.body, { ok: false, code: "INTERNAL_ERROR", message: "Error interno" });
    assert.deepEqual(log.mock.calls.map((call) => call.arguments[0]), [failure]);
  });

  it("si la respuesta ya empezo a enviarse, el manejador delega en Express en vez de escribir otra", (t) => {
    const next = t.mock.fn();

    errorHandler(new Error("tarde"), {}, { headersSent: true }, next);

    assert.equal(next.mock.callCount(), 1);
  });
});
