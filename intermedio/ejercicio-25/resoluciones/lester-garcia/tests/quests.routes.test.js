import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

let server;
let baseUrl;

describe("Testing de Integración de Rutas HTTP — /api/v1/quests", () => {
  before(async () => {
    await new Promise((resolve) => {
      server = app.listen(0, () => {
        const { port } = server.address();
        baseUrl = `http://127.0.0.1:${port}/api/v1`;
        resolve();
      });
    });
  });

  after(async () => {
    await new Promise((resolve) => server.close(resolve));
  });

  it("GET /quests debe responder 200 OK, header X-Request-Id y listado de misiones", async () => {
    const response = await fetch(`${baseUrl}/quests`);
    const body = await response.json();

    assert.equal(response.status, 200);
    assert.ok(response.headers.get("x-request-id"));
    assert.equal(body.status, "success");
    assert.ok(Array.isArray(body.data));
    assert.ok(body.data.length >= 2);
  });

  it("GET /quests/:id debe devolver 200 OK para una misión existente y 404 para una inexistente", async () => {
    const okRes = await fetch(`${baseUrl}/quests/QST-01`);
    const okBody = await okRes.json();
    assert.equal(okRes.status, 200);
    assert.equal(okBody.data.id, "QST-01");

    const notFoundRes = await fetch(`${baseUrl}/quests/QST-999`);
    const notFoundBody = await notFoundRes.json();
    assert.equal(notFoundRes.status, 404);
    assert.equal(notFoundBody.status, "fail");
  });

  it("POST /quests debe responder 201 Created al publicar una misión válida", async () => {
    const response = await fetch(`${baseUrl}/quests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Asedio a la Ciudadela Oscura",
        region: "Tierras Baldías",
        difficultyRank: "Legendario",
        recommendedLevel: 80,
        goldReward: 12000
      })
    });
    const body = await response.json();

    assert.equal(response.status, 201);
    assert.equal(body.status, "success");
    assert.equal(body.data.difficultyRank, "Legendario");
  });

  it("POST /quests debe responder 400 Bad Request con validationErrors ante datos inválidos", async () => {
    const response = await fetch(`${baseUrl}/quests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "X",
        region: "",
        difficultyRank: "Inexistente",
        recommendedLevel: 250,
        goldReward: 1
      })
    });
    const body = await response.json();

    assert.equal(response.status, 400);
    assert.equal(body.status, "fail");
    assert.ok(Array.isArray(body.validationErrors));
    assert.ok(body.validationErrors.length >= 3);
  });
});
