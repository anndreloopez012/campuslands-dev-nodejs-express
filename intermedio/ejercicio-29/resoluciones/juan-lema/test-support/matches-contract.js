import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { startApp } from "./client.js";

const validBody = { homeTeam: "Aguilas FC", awayTeam: "Halcones Sala", modality: "futbol" };

function describeMatchesApiContract(label, createAppFn) {
  describe(label, () => {
    let client;
    beforeEach(async () => {
      client = await startApp(createAppFn());
    });
    afterEach(() => client.close());

    const create = async (overrides = {}) => (await client.request("POST", "/matches", { json: { ...validBody, ...overrides } })).body.data;

    it("GET /health responde ok", async () => {
      const response = await client.request("GET", "/health");

      assert.equal(response.status, 200);
      assert.equal(response.body.ok, true);
    });

    describe("POST /matches", () => {
      it("201 crea el partido programado, sin marcador, con Location", async () => {
        const response = await client.request("POST", "/matches", { json: validBody });

        assert.equal(response.status, 201);
        assert.equal(response.headers.get("location"), "/matches/1");
        assert.deepEqual(response.body.data, { id: 1, homeTeam: "Aguilas FC", awayTeam: "Halcones Sala", modality: "futbol", status: "programado", homeScore: null, awayScore: null });
      });

      it("recorta los nombres de los equipos", async () => {
        const match = await create({ homeTeam: "  Aguilas FC  " });
        assert.equal(match.homeTeam, "Aguilas FC");
      });

      it("asigna ids consecutivos", async () => {
        assert.equal((await create()).id, 1);
        assert.equal((await create({ homeTeam: "Otro", awayTeam: "Mas otro" })).id, 2);
      });

      for (const [label, body, code] of [
        ["sin homeTeam", { awayTeam: "Halcones Sala", modality: "futbol" }, "INVALID_BODY"],
        ["homeTeam de 1 caracter", { ...validBody, homeTeam: "A" }, "INVALID_BODY"],
        ["homeTeam de 41 caracteres", { ...validBody, homeTeam: "x".repeat(41) }, "INVALID_BODY"],
        ["sin awayTeam", { homeTeam: "Aguilas FC", modality: "futbol" }, "INVALID_BODY"],
        ["awayTeam de 1 caracter", { ...validBody, awayTeam: "B" }, "INVALID_BODY"],
        ["awayTeam de 41 caracteres", { ...validBody, awayTeam: "x".repeat(41) }, "INVALID_BODY"],
        ["mismo equipo en ambos lados", { homeTeam: "Aguilas FC", awayTeam: "Aguilas FC", modality: "futbol" }, "INVALID_BODY"],
        ["mismo equipo con espacios distintos", { homeTeam: "Aguilas FC", awayTeam: "  Aguilas FC  ", modality: "futbol" }, "INVALID_BODY"],
        ["modality desconocida", { ...validBody, modality: "futbol_7" }, "INVALID_BODY"],
        ["sin modality", { homeTeam: "X", awayTeam: "Y" }, "INVALID_BODY"],
        ["cuerpo vacio", {}, "INVALID_BODY"],
      ]) {
        it(`400 ${code}: ${label}`, async () => {
          const response = await client.request("POST", "/matches", { json: body });

          assert.equal(response.status, 400);
          assert.equal(response.body.code, code);
        });
      }

      it("400 si no hay cuerpo", async () => {
        assert.equal((await client.request("POST", "/matches")).status, 400);
      });

      it("acepta futbol_sala como modalidad", async () => {
        assert.equal((await create({ modality: "futbol_sala" })).modality, "futbol_sala");
      });
    });

    describe("GET /matches y GET /matches/:id", () => {
      it("200 con lista vacia al inicio", async () => {
        assert.deepEqual((await client.request("GET", "/matches")).body.data, []);
      });

      it("filtra por modality y por status combinados", async () => {
        await create({ modality: "futbol" });
        const salaMatch = await create({ homeTeam: "Equipo A", awayTeam: "Equipo B", modality: "futbol_sala" });

        assert.equal((await client.request("GET", "/matches?modality=futbol_sala")).body.data.length, 1);
        assert.equal((await client.request("GET", "/matches?status=programado")).body.data.length, 2);
        await client.request("PATCH", `/matches/${salaMatch.id}/start`);
        assert.equal((await client.request("GET", "/matches?modality=futbol_sala&status=en_juego")).body.data.length, 1);
        assert.equal((await client.request("GET", "/matches?modality=futbol_sala&status=programado")).body.data.length, 0);
      });

      for (const [query, code] of [["?modality=futbol_7", "INVALID_QUERY"], ["?status=pausado", "INVALID_QUERY"]]) {
        it(`400 ${code} con ${query}`, async () => {
          const response = await client.request("GET", `/matches${query}`);

          assert.equal(response.status, 400);
          assert.equal(response.body.code, code);
        });
      }

      it("GET /matches/:id devuelve el partido", async () => {
        const created = await create();
        const fetched = await client.request("GET", `/matches/${created.id}`);

        assert.equal(fetched.status, 200);
        assert.deepEqual(fetched.body.data, created);
      });

      for (const id of ["abc", "0", "-1", "1.5", "01"]) {
        it(`400 INVALID_ID con id ${JSON.stringify(id)}`, async () => {
          assert.equal((await client.request("GET", `/matches/${id}`)).body.code, "INVALID_ID");
        });
      }

      it("404 NOT_FOUND con un id inexistente", async () => {
        const response = await client.request("GET", "/matches/99");

        assert.equal(response.status, 404);
        assert.equal(response.body.code, "NOT_FOUND");
      });
    });

    describe("ciclo de vida: programado -> en_juego -> finalizado", () => {
      it("start pone en_juego y el marcador en 0-0", async () => {
        const created = await create();
        const started = await client.request("PATCH", `/matches/${created.id}/start`);

        assert.equal(started.status, 200);
        assert.equal(started.body.data.status, "en_juego");
        assert.equal(started.body.data.homeScore, 0);
        assert.equal(started.body.data.awayScore, 0);
      });

      it("score actualiza el marcador solo si esta en_juego", async () => {
        const created = await create();
        await client.request("PATCH", `/matches/${created.id}/start`);
        const scored = await client.request("PATCH", `/matches/${created.id}/score`, { json: { homeScore: 2, awayScore: 1 } });

        assert.equal(scored.status, 200);
        assert.equal(scored.body.data.homeScore, 2);
        assert.equal(scored.body.data.awayScore, 1);
      });

      it("se puede anotar varias veces (el marcador se reemplaza, no se acumula)", async () => {
        const created = await create();
        await client.request("PATCH", `/matches/${created.id}/start`);
        await client.request("PATCH", `/matches/${created.id}/score`, { json: { homeScore: 1, awayScore: 0 } });
        const second = await client.request("PATCH", `/matches/${created.id}/score`, { json: { homeScore: 2, awayScore: 1 } });

        assert.equal(second.body.data.homeScore, 2);
        assert.equal(second.body.data.awayScore, 1);
      });

      it("finish pone finalizado solo si esta en_juego", async () => {
        const created = await create();
        await client.request("PATCH", `/matches/${created.id}/start`);
        const finished = await client.request("PATCH", `/matches/${created.id}/finish`);

        assert.equal(finished.status, 200);
        assert.equal(finished.body.data.status, "finalizado");
      });

      it("409 INVALID_TRANSITION: iniciar un partido que ya esta en_juego", async () => {
        const created = await create();
        await client.request("PATCH", `/matches/${created.id}/start`);
        const response = await client.request("PATCH", `/matches/${created.id}/start`);

        assert.equal(response.status, 409);
        assert.equal(response.body.code, "INVALID_TRANSITION");
      });

      it("409 INVALID_TRANSITION: anotar en un partido programado (sin iniciar)", async () => {
        const created = await create();
        const response = await client.request("PATCH", `/matches/${created.id}/score`, { json: { homeScore: 1, awayScore: 0 } });

        assert.equal(response.status, 409);
        assert.equal(response.body.code, "INVALID_TRANSITION");
      });

      it("409 INVALID_TRANSITION: finalizar un partido programado (sin iniciar)", async () => {
        const created = await create();
        const response = await client.request("PATCH", `/matches/${created.id}/finish`);

        assert.equal(response.status, 409);
        assert.equal(response.body.code, "INVALID_TRANSITION");
      });

      it("409 INVALID_TRANSITION: anotar o finalizar un partido ya finalizado", async () => {
        const created = await create();
        await client.request("PATCH", `/matches/${created.id}/start`);
        await client.request("PATCH", `/matches/${created.id}/finish`);

        assert.equal((await client.request("PATCH", `/matches/${created.id}/score`, { json: { homeScore: 1, awayScore: 0 } })).status, 409);
        assert.equal((await client.request("PATCH", `/matches/${created.id}/finish`)).status, 409);
      });

      for (const [label, body] of [
        ["homeScore negativo", { homeScore: -1, awayScore: 0 }],
        ["homeScore decimal", { homeScore: 1.5, awayScore: 0 }],
        ["homeScore como texto", { homeScore: "1", awayScore: 0 }],
        ["sin awayScore", { homeScore: 1 }],
        ["sin cuerpo", undefined],
      ]) {
        it(`400 INVALID_BODY al anotar: ${label}`, async () => {
          const created = await create();
          await client.request("PATCH", `/matches/${created.id}/start`);
          const response = await client.request("PATCH", `/matches/${created.id}/score`, body === undefined ? {} : { json: body });

          assert.equal(response.status, 400);
          assert.equal(response.body.code, "INVALID_BODY");
        });
      }

      for (const action of ["start", "score", "finish"]) {
        const body = action === "score" ? { json: { homeScore: 1, awayScore: 0 } } : {};

        for (const id of ["abc", "0", "-1", "1.5", "01"]) {
          it(`400 INVALID_ID en PATCH /matches/${id}/${action}`, async () => {
            const response = await client.request("PATCH", `/matches/${id}/${action}`, body);

            assert.equal(response.status, 400);
            assert.equal(response.body.code, "INVALID_ID");
          });
        }

        it(`404 NOT_FOUND en PATCH /matches/99/${action}`, async () => {
          const response = await client.request("PATCH", `/matches/99/${action}`, body);

          assert.equal(response.status, 404);
          assert.equal(response.body.code, "NOT_FOUND");
        });
      }

      it("una transicion rechazada no cambia el estado del partido", async () => {
        const created = await create();
        await client.request("PATCH", `/matches/${created.id}/finish`);

        assert.equal((await client.request("GET", `/matches/${created.id}`)).body.data.status, "programado");
      });
    });

    describe("errores generales", () => {
      it("404 ROUTE_NOT_FOUND en una ruta desconocida", async () => {
        const response = await client.request("GET", "/nada");

        assert.equal(response.status, 404);
        assert.equal(response.body.code, "ROUTE_NOT_FOUND");
      });

      it("400 INVALID_JSON si el cuerpo no es JSON valido", async () => {
        const response = await client.request("POST", "/matches", { body: "{oops", headers: { "Content-Type": "application/json" } });

        assert.equal(response.status, 400);
        assert.equal(response.body.code, "INVALID_JSON");
      });
    });
  });
}

export { describeMatchesApiContract, validBody };
