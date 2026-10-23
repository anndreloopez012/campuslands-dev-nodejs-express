import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRankingClient } from "../src/services/ranking-client.js";

const jsonResponse = (status, data) => ({ status, ok: status >= 200 && status < 300, json: async () => data });

describe("createRankingClient (mockea la dependencia externa: fetch)", () => {
  it("pide la URL correcta y devuelve el rank", async () => {
    const calls = [];
    const fetchImpl = async (url) => {
      calls.push(url);
      return jsonResponse(200, { rank: 1750 });
    };
    const client = createRankingClient({ baseUrl: "https://ranking.test", fetchImpl });

    assert.equal(await client.getRank(42), 1750);
    assert.deepEqual(calls, ["https://ranking.test/players/42/rank"]);
  });

  it("un 404 se interpreta como jugador sin rank (null), no como error", async () => {
    const client = createRankingClient({ baseUrl: "https://ranking.test", fetchImpl: async () => jsonResponse(404, {}) });

    assert.equal(await client.getRank(1), null);
  });

  it("un rank invalido en la respuesta lanza error", async () => {
    for (const rank of [-1, 1.5, "1500", null, undefined]) {
      const client = createRankingClient({ fetchImpl: async () => jsonResponse(200, { rank }) });

      await assert.rejects(() => client.getRank(1), /rank invalido/);
    }
  });

  it("un estado 500 de la API lanza error con el estado", async () => {
    const client = createRankingClient({ fetchImpl: async () => jsonResponse(500, {}) });

    await assert.rejects(() => client.getRank(1), /500/);
  });

  it("un fallo de red (fetch rechaza) se envuelve con un mensaje claro", async () => {
    const client = createRankingClient({ fetchImpl: async () => { throw new Error("ECONNREFUSED"); } });

    await assert.rejects(() => client.getRank(1), /No se pudo contactar.*ECONNREFUSED/);
  });

  it("usa RANKING_API_URL o el baseUrl por defecto cuando no se pasa uno explicito", async () => {
    const calls = [];
    const client = createRankingClient({ fetchImpl: async (url) => (calls.push(url), jsonResponse(200, { rank: 1000 })) });

    await client.getRank(7);
    assert.match(calls[0], /^https?:\/\/.+\/players\/7\/rank$/);
  });
});

describe("createRankingClient con fetch global mockeado (t.mock.method)", () => {
  it("por defecto usa globalThis.fetch cuando no se inyecta fetchImpl", async (t) => {
    t.mock.method(globalThis, "fetch", async (url) => {
      assert.equal(url, "https://ranking.mockeado.test/players/9/rank");
      return jsonResponse(200, { rank: 2100 });
    });

    const client = createRankingClient({ baseUrl: "https://ranking.mockeado.test" });

    assert.equal(await client.getRank(9), 2100);
    assert.equal(globalThis.fetch.mock.callCount(), 1);
  });
});
