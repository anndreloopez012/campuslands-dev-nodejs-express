import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createMatchesService, MAPS } from "../src/services/matches.service.js";

function assertAppError(action, status, code, messagePattern) {
  return assert.rejects(action, (error) => {
    assert.equal(error.name, "AppError");
    assert.equal(error.status, status);
    assert.equal(error.code, code);
    if (messagePattern) assert.match(error.message, messagePattern);
    return true;
  });
}

function fakeRankingClient(ranksById = {}) {
  const calls = [];
  return {
    calls,
    getRank: async (playerId) => {
      calls.push(playerId);
      if (!(playerId in ranksById)) return null;

      const value = ranksById[playerId];
      if (value instanceof Error) throw value;
      return value;
    },
  };
}

const FIXED_NOW = () => new Date("2026-01-15T10:00:00.000Z");
const validBody = { mapName: MAPS[0], players: [1, 2] };

describe("createMatchesService (dependencias mockeadas a mano, sin red)", () => {
  let rankingClient;
  let service;

  beforeEach(() => {
    rankingClient = fakeRankingClient({ 1: 1200, 2: 1800 });
    service = createMatchesService({ rankingClient, now: FIXED_NOW });
  });

  describe("create", () => {
    it("consulta el rank de cada jugador exactamente una vez", async () => {
      await service.create(validBody);

      assert.deepEqual(rankingClient.calls, [1, 2]);
    });

    it("calcula el promedio y el tier a partir de los ranks devueltos por la dependencia", async () => {
      const match = await service.create(validBody);

      assert.equal(match.averageRank, 1500);
      assert.equal(match.tier, "oro");
      assert.deepEqual(match.players, [{ playerId: 1, rank: 1200 }, { playerId: 2, rank: 1800 }]);
    });

    it("usa el reloj inyectado, no el reloj real", async () => {
      const match = await service.create(validBody);

      assert.equal(match.createdAt, "2026-01-15T10:00:00.000Z");
    });

    it("sin reloj inyectado usa la hora real (Date por defecto)", async () => {
      const before = Date.now();
      const withRealClock = createMatchesService({ rankingClient: fakeRankingClient({ 1: 1000, 2: 1000 }) });
      const match = await withRealClock.create(validBody);

      assert.ok(Math.abs(Date.parse(match.createdAt) - before) < 5000, match.createdAt);
    });

    it("asigna ids consecutivos", async () => {
      assert.equal((await service.create(validBody)).id, 1);
      assert.equal((await service.create({ mapName: MAPS[1], players: [3, 4] })).id, 2);
    });

    const tiers = [
      [999, "bronce"],
      [1000, "plata"],
      [1499, "plata"],
      [1500, "oro"],
      [1999, "oro"],
      [2000, "platino"],
      [2499, "platino"],
      [2500, "diamante"],
      [9999, "diamante"],
    ];

    for (const [rank, tier] of tiers) {
      it(`un promedio de ${rank} da el tier "${tier}"`, async () => {
        const client = fakeRankingClient({ 10: rank, 11: rank });
        const match = await createMatchesService({ rankingClient: client, now: FIXED_NOW }).create({ mapName: MAPS[0], players: [10, 11] });

        assert.equal(match.tier, tier);
      });
    }

    it("un jugador sin rank (null) queda fuera del promedio pero se conserva en players", async () => {
      const client = fakeRankingClient({ 5: 2000 });
      const match = await createMatchesService({ rankingClient: client, now: FIXED_NOW }).create({ mapName: MAPS[0], players: [5, 6] });

      assert.equal(match.averageRank, 2000);
      assert.deepEqual(match.players, [{ playerId: 5, rank: 2000 }, { playerId: 6, rank: null }]);
    });

    it("si ningun jugador tiene rank, averageRank es null y el tier es sin-clasificar", async () => {
      const client = fakeRankingClient({});
      const match = await createMatchesService({ rankingClient: client, now: FIXED_NOW }).create({ mapName: MAPS[0], players: [7, 8] });

      assert.equal(match.averageRank, null);
      assert.equal(match.tier, "sin-clasificar");
    });

    it("si la dependencia de ranking falla para un jugador, se traduce a 502 RANKING_UNAVAILABLE", async () => {
      const client = fakeRankingClient({ 1: new Error("timeout de red") });

      await assertAppError(() => createMatchesService({ rankingClient: client, now: FIXED_NOW }).create(validBody), 502, "RANKING_UNAVAILABLE");
    });

    it("un fallo de la dependencia no crea la partida ni consume el siguiente id", async () => {
      const client = fakeRankingClient({ 1: new Error("caida") });
      const broken = createMatchesService({ rankingClient: client, now: FIXED_NOW });

      await assert.rejects(() => broken.create(validBody));
      assert.equal((await broken.create({ mapName: MAPS[0], players: [3, 4] })).id, 1);
    });

    for (const [label, mapName] of [["mapa desconocido", "Base Lunar"], ["vacio", ""], ["numerico", 5], ["nulo", null], ["ausente", undefined]]) {
      it(`rechaza mapName ${label}`, async () => {
        await assertAppError(() => service.create({ ...validBody, mapName }), 400, "INVALID_BODY", /mapName/);
        assert.deepEqual(rankingClient.calls, []);
      });
    }

    for (const [label, players] of [
      ["menos de 2 jugadores", [1]],
      ["mas de 10 jugadores", Array.from({ length: 11 }, (_, i) => i + 1)],
      ["no es un arreglo", "1,2"],
      ["ausente", undefined],
      ["id decimal", [1, 2.5]],
      ["id cero", [0, 1]],
      ["id negativo", [-1, 2]],
      ["id como texto", [1, "2"]],
      ["ids repetidos", [1, 1]],
    ]) {
      it(`rechaza players: ${label}`, async () => {
        await assertAppError(() => service.create({ ...validBody, players }), 400, "INVALID_BODY");
        assert.deepEqual(rankingClient.calls, [], "no debe consultar el ranking si la validacion falla antes");
      });
    }

    it("acepta el limite de 10 jugadores", async () => {
      const players = Array.from({ length: 10 }, (_, i) => i + 1);
      const client = fakeRankingClient(Object.fromEntries(players.map((id) => [id, 1000])));

      const match = await createMatchesService({ rankingClient: client, now: FIXED_NOW }).create({ mapName: MAPS[0], players });
      assert.equal(match.players.length, 10);
    });

    it("sin cuerpo lanza INVALID_BODY", async () => {
      await assertAppError(() => service.create(), 400, "INVALID_BODY");
    });
  });

  describe("list y getById", () => {
    it("list devuelve copias: mutar el resultado no afecta al estado interno", async () => {
      await service.create(validBody);
      const first = service.list();
      first[0].tier = "hackeado";
      first.push({ id: 99 });

      assert.equal(service.list().length, 1);
      assert.notEqual(service.list()[0].tier, "hackeado");
    });

    it("getById devuelve una copia", async () => {
      const created = await service.create(validBody);
      const fetched = service.getById(created.id);
      fetched.tier = "hackeado";

      assert.notEqual(service.getById(created.id).tier, "hackeado");
    });

    for (const id of ["abc", "0", "-1", "1.5", "01"]) {
      it(`getById rechaza el id invalido ${JSON.stringify(id)}`, () => {
        assert.throws(() => service.getById(id), (error) => error.code === "INVALID_ID");
      });
    }

    it("getById de un id inexistente da 404", async () => {
      await service.create(validBody);

      assert.throws(() => service.getById(99), (error) => error.code === "NOT_FOUND" && error.status === 404);
    });
  });
});
