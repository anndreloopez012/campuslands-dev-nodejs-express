"use strict";
const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const request = require("supertest");
const app = require("../src/app");
let server, api;
before(() => {
  server = app.listen(0);
  api = request(server);
});
after(() => new Promise((resolve) => server.close(resolve)));
test("health exposes correlation id", async () => {
  const r = await api.get("/health");
  assert.equal(r.status, 200);
  assert.ok(r.headers["x-request-id"]);
});
test("profiles validate input, create and list", async () => {
  assert.equal((await api.post("/profiles").send({ name: "x" })).status, 400);
  const created = await api.post("/profiles").send({ name: "Guild Beta" });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.name, "Guild Beta");
  assert.ok(
    (await api.get("/profiles")).body.data.some(
      (p) => p.id === created.body.data.id,
    ),
  );
});
