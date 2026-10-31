import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import app from "../src/app.js";

describe("Avanzado 25 — Testing de Integración HTTP (Raids RPG)", () => {
  let server;
  let baseUrl;

  before(async () => {
    server = app.listen(0);
    const { port } = server.address();
    baseUrl = `http://127.0.0.1:${port}`;
  });

  after(() => {
    server.close();
  });

  it("GET /avanzado/ejercicio-25 debe responder 200 y el tópico correcto", async () => {
    const res = await fetch(`${baseUrl}/avanzado/ejercicio-25`);
    const body = await res.json();
    assert.equal(res.status, 200);
    assert.equal(body.ok, true);
    assert.equal(body.topic, "testing de integracion");
  });

  it("POST /api/v1/raids debe crear una nueva Raid RPG (201) y rechazar datos incompletos (400)", async () => {
    const createRes = await fetch(`${baseUrl}/api/v1/raids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        dungeon: "Santuario Rubí",
        boss: "Halion el Destructor",
        minGearScore: 6000
      })
    });
    const createdBody = await createRes.json();
    assert.equal(createRes.status, 201);
    assert.equal(createdBody.data.id, "RAID-02");

    const badRes = await fetch(`${baseUrl}/api/v1/raids`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });
    assert.equal(badRes.status, 400);
  });
});
