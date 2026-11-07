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
test("health returns request correlation id", async () => {
  const response = await api.get("/health");
  assert.equal(response.status, 200);
  assert.ok(response.headers["x-request-id"]);
});
test("profile validation and CRUD list are integrated", async () => {
  const invalid = await api.post("/profiles").send({ name: "x" });
  assert.equal(invalid.status, 400);
  const created = await api.post("/profiles").send({ name: "Guild Alpha" });
  assert.equal(created.status, 201);
  assert.equal(created.body.data.name, "Guild Alpha");
  const list = await api.get("/profiles");
  assert.ok(list.body.data.some((x) => x.id === created.body.data.id));
});
