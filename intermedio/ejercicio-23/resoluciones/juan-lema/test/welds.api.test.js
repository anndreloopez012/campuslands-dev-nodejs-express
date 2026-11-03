import { after, before, describe, it } from "node:test";
import { once } from "node:events";
import assert from "node:assert/strict";
import app from "../src/app.js";

const validWeld = { client: "Taller Norte", process: "MIG", material: "acero", thicknessMm: 3 };

describe("API /welds", () => {
  let server;
  let baseUrl;

  before(async () => {
    server = app.listen(0);
    await once(server, "listening");
    baseUrl = `http://127.0.0.1:${server.address().port}`;
  });

  after(async () => {
    server.closeAllConnections();
    server.close();
    await once(server, "close");
  });

  async function api(path, { method = "GET", body, raw } = {}) {
    const payload = raw ?? (body === undefined ? undefined : JSON.stringify(body));
    const response = await fetch(`${baseUrl}${path}`, { method, headers: payload === undefined ? {} : { "Content-Type": "application/json" }, body: payload });

    return { status: response.status, contentType: response.headers.get("content-type"), body: await response.json() };
  }

  const createWeld = async (overrides = {}) => (await api("/welds", { method: "POST", body: { ...validWeld, ...overrides } })).body.data;

  describe("GET", () => {
    it("/health responde ok", async () => {
      const { status, body } = await api("/health");

      assert.equal(status, 200);
      assert.equal(body.ok, true);
    });

    it("/welds lista las soldaduras y responde JSON", async () => {
      const { status, contentType, body } = await api("/welds");

      assert.equal(status, 200);
      assert.match(contentType, /application\/json/);
      assert.ok(Array.isArray(body.data));
      assert.ok(body.data.some((weld) => weld.id === 1));
    });

    it("/welds/:id devuelve la soldadura pedida", async () => {
      const { status, body } = await api("/welds/1");

      assert.equal(status, 200);
      assert.deepEqual(body.data, { id: 1, client: "Taller Ferrer", process: "MIG", material: "acero", thicknessMm: 3, amperage: 120, passes: 1, status: "pendiente" });
    });

    for (const [id, expectedStatus] of [["abc", 400], ["1.5", 400], ["9999", 404], ["-1", 404]]) {
      it(`/welds/${id} -> ${expectedStatus}`, async () => {
        const { status, body } = await api(`/welds/${id}`);

        assert.equal(status, expectedStatus);
        assert.equal(body.ok, false);
      });
    }

    it("una ruta inexistente responde 404 en JSON", async () => {
      const { status, body } = await api("/nada");

      assert.equal(status, 404);
      assert.deepEqual(body, { ok: false, message: "Ruta no encontrada" });
    });
  });

  describe("POST /welds", () => {
    it("crea la soldadura, calcula los parametros y queda consultable", async () => {
      const { status, body } = await api("/welds", { method: "POST", body: { client: "Herreria Sur", process: "TIG", material: "aluminio", thicknessMm: 4 } });

      const { id, ...created } = body.data;

      assert.equal(status, 201);
      assert.equal(body.ok, true);
      assert.equal(typeof id, "number");
      assert.deepEqual(created, { client: "Herreria Sur", process: "TIG", material: "aluminio", thicknessMm: 4, amperage: 168, passes: 1, status: "pendiente" });

      const fetched = await api(`/welds/${id}`);
      assert.deepEqual(fetched.body.data, body.data);

      const list = await api("/welds");
      assert.ok(list.body.data.some((weld) => weld.id === body.data.id));
    });

    it("asigna ids distintos a cada soldadura", async () => {
      const [a, b] = [await createWeld(), await createWeld()];

      assert.notEqual(a.id, b.id);
    });

    it("recorta los espacios del cliente", async () => {
      assert.equal((await createWeld({ client: "  Taller X  " })).client, "Taller X");
    });

    it("ignora campos calculados enviados por el cliente (id, amperage, passes, status)", async () => {
      const weld = await createWeld({ id: 999, amperage: 9999, passes: 50, status: "terminado" });

      assert.notEqual(weld.id, 999);
      assert.equal(weld.amperage, 120);
      assert.equal(weld.passes, 1);
      assert.equal(weld.status, "pendiente");
    });

    for (const thicknessMm of [0.5, 25]) {
      it(`acepta el espesor limite ${thicknessMm} mm`, async () => {
        const { status } = await api("/welds", { method: "POST", body: { ...validWeld, thicknessMm } });

        assert.equal(status, 201);
      });
    }

    const invalidBodies = [
      ["sin cliente", { ...validWeld, client: undefined }, /client/],
      ["cliente en blanco", { ...validWeld, client: "   " }, /client/],
      ["cliente que no es texto", { ...validWeld, client: 123 }, /client/],
      ["proceso desconocido", { ...validWeld, process: "OXI" }, /process/],
      ["proceso en minusculas", { ...validWeld, process: "mig" }, /process/],
      ["proceso de prototipo", { ...validWeld, process: "constructor" }, /process/],
      ["material desconocido", { ...validWeld, material: "titanio" }, /material/],
      ["sin espesor", { ...validWeld, thicknessMm: undefined }, /thicknessMm/],
      ["espesor como texto", { ...validWeld, thicknessMm: "6" }, /thicknessMm/],
      ["espesor booleano", { ...validWeld, thicknessMm: true }, /thicknessMm/],
      ["espesor nulo", { ...validWeld, thicknessMm: null }, /thicknessMm/],
      ["espesor bajo el minimo", { ...validWeld, thicknessMm: 0.49 }, /thicknessMm/],
      ["espesor sobre el maximo", { ...validWeld, thicknessMm: 25.01 }, /thicknessMm/],
      ["espesor negativo", { ...validWeld, thicknessMm: -3 }, /thicknessMm/],
      ["cuerpo vacio", {}, /client/],
    ];

    for (const [label, body, messagePattern] of invalidBodies) {
      it(`rechaza con 400: ${label}`, async () => {
        const response = await api("/welds", { method: "POST", body });

        assert.equal(response.status, 400);
        assert.equal(response.body.ok, false);
        assert.match(response.body.message, messagePattern);
      });
    }

    it("rechaza con 400 una peticion sin cuerpo", async () => {
      assert.equal((await api("/welds", { method: "POST" })).status, 400);
    });

    it("rechaza con 400 un JSON malformado (no 500)", async () => {
      const { status, body } = await api("/welds", { method: "POST", raw: '{"client": "Taller", ' });

      assert.equal(status, 400);
      assert.equal(body.message, "El cuerpo no es un JSON valido");
    });

    it("una peticion rechazada no crea nada", async () => {
      const before = (await api("/welds")).body.data.length;
      await api("/welds", { method: "POST", body: { ...validWeld, thicknessMm: 100 } });

      assert.equal((await api("/welds")).body.data.length, before);
    });
  });

  describe("PATCH /welds/:id/status", () => {
    const patch = (id, body) => api(`/welds/${id}/status`, { method: "PATCH", body });

    it("recorre el ciclo completo pendiente -> en_proceso -> terminado", async () => {
      const { id } = await createWeld();

      const started = await patch(id, { status: "en_proceso" });
      assert.equal(started.status, 200);
      assert.equal(started.body.data.status, "en_proceso");

      const finished = await patch(id, { status: "terminado" });
      assert.equal(finished.status, 200);
      assert.equal(finished.body.data.status, "terminado");
      assert.equal((await api(`/welds/${id}`)).body.data.status, "terminado");
    });

    it("permite cancelar una soldadura pendiente", async () => {
      const { id } = await createWeld();

      assert.equal((await patch(id, { status: "cancelado" })).body.data.status, "cancelado");
    });

    it("rechaza con 409 saltarse un paso (pendiente -> terminado) y no cambia el estado", async () => {
      const { id } = await createWeld();
      const response = await patch(id, { status: "terminado" });

      assert.equal(response.status, 409);
      assert.match(response.body.message, /pendiente a terminado/);
      assert.equal((await api(`/welds/${id}`)).body.data.status, "pendiente");
    });

    it("rechaza con 409 salir de un estado final", async () => {
      const { id } = await createWeld();
      await patch(id, { status: "cancelado" });

      assert.equal((await patch(id, { status: "en_proceso" })).status, 409);
    });

    it("rechaza con 409 repetir el mismo estado", async () => {
      const { id } = await createWeld();

      assert.equal((await patch(id, { status: "pendiente" })).status, 409);
    });

    for (const [label, body] of [["estado desconocido", { status: "archivado" }], ["sin estado", {}], ["estado que no es texto", { status: 5 }], ["estado de prototipo", { status: "constructor" }]]) {
      it(`rechaza con 400: ${label}`, async () => {
        const { id } = await createWeld();
        const response = await patch(id, body);

        assert.equal(response.status, 400);
        assert.match(response.body.message, /status/);
      });
    }

    it("responde 404 si la soldadura no existe y 400 si el id no es numerico", async () => {
      assert.equal((await patch(9999, { status: "en_proceso" })).status, 404);
      assert.equal((await patch("abc", { status: "en_proceso" })).status, 400);
    });
  });
});
