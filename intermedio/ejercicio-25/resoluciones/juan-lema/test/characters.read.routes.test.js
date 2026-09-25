import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { startApp } from "../test-support/client.js";

const ids = (response) => response.body.data.map((character) => character.id);

let client;
beforeEach(async () => {
  client = await startApp(createApp());
});
afterEach(() => client.close());

describe("GET /characters", () => {
  it("lista todo por defecto con su envoltorio, meta y X-Total-Count", async () => {
    const response = await client.request("GET", "/characters");

    assert.equal(response.status, 200);
    assert.match(response.headers.get("content-type"), /^application\/json; charset=utf-8$/);
    assert.equal(response.body.ok, true);
    assert.deepEqual(ids(response), [1, 2, 3, 4, 5, 6, 7, 8]);
    assert.deepEqual(response.body.meta, { page: 1, limit: 10, total: 8, totalPages: 1 });
    assert.equal(response.headers.get("x-total-count"), "8");
  });

  it("cada personaje tiene exactamente los campos del contrato", async () => {
    const response = await client.request("GET", "/characters");

    for (const character of response.body.data) assert.deepEqual(Object.keys(character).sort(), ["class", "id", "level", "name", "ownerId"]);
    assert.deepEqual(response.body.data[0], { id: 1, name: "Lyra Alba", class: "clerigo", level: 12, ownerId: 1 });
  });

  describe("filtros", () => {
    const filters = [
      ["?class=guerrero", [2, 4]],
      ["?class=mago", [3, 6]],
      ["?class=picaro", [5, 8]],
      ["?class=clerigo", [1, 7]],
      ["?minLevel=1", [1, 2, 3, 4, 5, 6, 7, 8]],
      ["?minLevel=25", [2, 4, 6, 8]],
      ["?minLevel=40", [4]],
      ["?minLevel=41", []],
      ["?minLevel=60", []],
      ["?class=mago&minLevel=10", [6]],
      ["?class=guerrero&minLevel=30", [4]],
      ["?class=picaro&minLevel=30", []],
      ["?foo=bar", [1, 2, 3, 4, 5, 6, 7, 8]],
    ];

    for (const [query, expected] of filters) {
      it(`${query} -> ids ${JSON.stringify(expected)}`, async () => {
        const response = await client.request("GET", `/characters${query}`);

        assert.equal(response.status, 200);
        assert.deepEqual(ids(response), expected);
        assert.equal(response.body.meta.total, expected.length);
        assert.equal(response.headers.get("x-total-count"), String(expected.length));
      });
    }
  });

  describe("orden", () => {
    const orders = [
      ["id", [1, 2, 3, 4, 5, 6, 7, 8]],
      ["name", [7, 3, 4, 1, 5, 8, 2, 6]],
      ["-name", [6, 2, 8, 5, 1, 4, 3, 7]],
      ["level", [7, 3, 1, 5, 2, 8, 6, 4]],
      ["-level", [4, 6, 8, 2, 5, 1, 3, 7]],
    ];

    for (const [sort, expected] of orders) {
      it(`?sort=${sort}`, async () => assert.deepEqual(ids(await client.request("GET", `/characters?sort=${sort}`)), expected));
    }

    it("los empates se resuelven por id ascendente en ambos sentidos", async () => {
      const token = await client.loginAs("aria");
      await client.request("POST", "/characters", { token, json: { name: "Nova", class: "guerrero", level: 25 } });

      assert.deepEqual(ids(await client.request("GET", "/characters?sort=level")), [7, 3, 1, 5, 2, 9, 8, 6, 4]);
      assert.deepEqual(ids(await client.request("GET", "/characters?sort=-level")), [4, 6, 8, 2, 9, 5, 1, 3, 7]);
    });

    it("el orden se aplica antes de paginar", async () => {
      assert.deepEqual(ids(await client.request("GET", "/characters?sort=-level&limit=2")), [4, 6]);
      assert.deepEqual(ids(await client.request("GET", "/characters?sort=-level&limit=5&page=2")), [1, 3, 7]);
    });
  });

  describe("paginacion", () => {
    const pages = [
      ["?limit=3", [1, 2, 3], { page: 1, limit: 3, total: 8, totalPages: 3 }],
      ["?limit=3&page=2", [4, 5, 6], { page: 2, limit: 3, total: 8, totalPages: 3 }],
      ["?limit=3&page=3", [7, 8], { page: 3, limit: 3, total: 8, totalPages: 3 }],
      ["?limit=3&page=4", [], { page: 4, limit: 3, total: 8, totalPages: 3 }],
      ["?limit=8", [1, 2, 3, 4, 5, 6, 7, 8], { page: 1, limit: 8, total: 8, totalPages: 1 }],
      ["?limit=7", [1, 2, 3, 4, 5, 6, 7], { page: 1, limit: 7, total: 8, totalPages: 2 }],
      ["?limit=1&page=8", [8], { page: 8, limit: 1, total: 8, totalPages: 8 }],
      ["?limit=50", [1, 2, 3, 4, 5, 6, 7, 8], { page: 1, limit: 50, total: 8, totalPages: 1 }],
      ["?class=guerrero&limit=1&page=2", [4], { page: 2, limit: 1, total: 2, totalPages: 2 }],
      ["?minLevel=60", [], { page: 1, limit: 10, total: 0, totalPages: 1 }],
    ];

    for (const [query, expected, meta] of pages) {
      it(`${query}`, async () => {
        const response = await client.request("GET", `/characters${query}`);

        assert.equal(response.status, 200);
        assert.deepEqual(ids(response), expected);
        assert.deepEqual(response.body.meta, meta);
      });
    }

    it("X-Total-Count es el total filtrado, no el tamano de la pagina", async () => {
      const { headers, body } = await client.request("GET", "/characters?limit=2");

      assert.equal(body.data.length, 2);
      assert.equal(headers.get("x-total-count"), "8");
    });
  });

  describe("parametros invalidos", () => {
    const invalid = [
      ["?class=bardo", /class/],
      ["?class=", /class/],
      ["?class=Mago", /class/],
      ["?class=mago&class=guerrero", /class/],
      ["?minLevel=0", /minLevel/],
      ["?minLevel=61", /minLevel/],
      ["?minLevel=-3", /minLevel/],
      ["?minLevel=abc", /minLevel/],
      ["?minLevel=1.5", /minLevel/],
      ["?minLevel=", /minLevel/],
      ["?minLevel=1&minLevel=2", /minLevel/],
      ["?sort=hp", /sort/],
      ["?sort=", /sort/],
      ["?sort=-id", /sort/],
      ["?sort=name,level", /sort/],
      ["?sort=name&sort=level", /sort/],
      ["?page=0", /page/],
      ["?page=-1", /page/],
      ["?page=abc", /page/],
      ["?page=1.5", /page/],
      ["?page=", /page/],
      ["?page=1000001", /page/],
      ["?limit=0", /limit/],
      ["?limit=51", /limit/],
      ["?limit=abc", /limit/],
      ["?limit=1.5", /limit/],
      ["?limit=", /limit/],
      ["?limit=3&limit=4", /limit/],
    ];

    for (const [query, pattern] of invalid) {
      it(`400 INVALID_QUERY: ${query}`, async () => {
        const response = await client.request("GET", `/characters${query}`);

        assert.equal(response.status, 400);
        assert.equal(response.body.ok, false);
        assert.equal(response.body.code, "INVALID_QUERY");
        assert.match(response.body.message, pattern);
        assert.equal(response.headers.get("x-total-count"), null);
      });
    }
  });
});

describe("GET /characters/:id", () => {
  it("devuelve el personaje", async () => {
    const response = await client.request("GET", "/characters/2");

    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { ok: true, data: { id: 2, name: "Thorin Escudo", class: "guerrero", level: 25, ownerId: 2 } });
  });

  for (const id of ["abc", "0", "-1", "1.5", "01", "1e3", "1%20", "%20"]) {
    it(`400 INVALID_ID: /characters/${id}`, async () => {
      const response = await client.request("GET", `/characters/${id}`);

      assert.equal(response.status, 400);
      assert.equal(response.body.code, "INVALID_ID");
    });
  }

  for (const id of ["9", "99", "99999999999999999999"]) {
    it(`404 NOT_FOUND: /characters/${id}`, async () => {
      const response = await client.request("GET", `/characters/${id}`);

      assert.equal(response.status, 404);
      assert.equal(response.body.code, "NOT_FOUND");
    });
  }

  it("una subruta desconocida es 404 ROUTE_NOT_FOUND", async () => {
    const response = await client.request("GET", "/characters/1/extra");

    assert.equal(response.status, 404);
    assert.equal(response.body.code, "ROUTE_NOT_FOUND");
  });

  describe("cache condicional (ETag)", () => {
    it("incluye ETag y responde 304 sin cuerpo si no cambio", async () => {
      const first = await client.request("GET", "/characters/1");
      const etag = first.headers.get("etag");
      const second = await client.request("GET", "/characters/1", { headers: { "If-None-Match": etag } });

      assert.match(etag, /^W\/".+"$/);
      assert.equal(second.status, 304);
      assert.equal(second.text, "");
    });

    it("un ETag ajeno no coincide y devuelve el recurso completo", async () => {
      const response = await client.request("GET", "/characters/1", { headers: { "If-None-Match": 'W/"otro"' } });

      assert.equal(response.status, 200);
      assert.equal(response.body.data.id, 1);
    });

    it("tras una modificacion el ETag cambia y el anterior ya no sirve", async () => {
      const before = (await client.request("GET", "/characters/1")).headers.get("etag");
      await client.request("PATCH", "/characters/1", { token: await client.loginAs("aria"), json: { level: 13 } });

      const stale = await client.request("GET", "/characters/1", { headers: { "If-None-Match": before } });
      assert.equal(stale.status, 200);
      assert.equal(stale.body.data.level, 13);
      assert.notEqual(stale.headers.get("etag"), before);
    });

    it("dos personajes distintos tienen ETag distinto", async () => {
      const a = (await client.request("GET", "/characters/1")).headers.get("etag");
      const b = (await client.request("GET", "/characters/2")).headers.get("etag");

      assert.notEqual(a, b);
    });

    it("el listado tambien tiene ETag y responde 304", async () => {
      const first = await client.request("GET", "/characters");
      const second = await client.request("GET", "/characters", { headers: { "If-None-Match": first.headers.get("etag") } });

      assert.equal(second.status, 304);
    });
  });
});

describe("comportamiento del enrutador", () => {
  it("HEAD devuelve los mismos headers que GET y ningun cuerpo", async () => {
    const get = await client.request("GET", "/characters/1");
    const head = await client.request("HEAD", "/characters/1");

    assert.equal(head.status, 200);
    assert.equal(head.text, "");
    assert.equal(head.headers.get("content-length"), get.headers.get("content-length"));
    assert.equal(head.headers.get("etag"), get.headers.get("etag"));
  });

  it("HEAD del listado conserva X-Total-Count", async () => {
    const head = await client.request("HEAD", "/characters?class=mago");

    assert.equal(head.status, 200);
    assert.equal(head.headers.get("x-total-count"), "2");
    assert.equal(head.text, "");
  });

  it("la barra final es opcional", async () => {
    assert.equal((await client.request("GET", "/characters/")).status, 200);
    assert.equal((await client.request("GET", "/characters/1/")).status, 200);
  });

  it("las rutas no distinguen mayusculas (comportamiento por defecto de Express)", async () => {
    assert.equal((await client.request("GET", "/Characters")).status, 200);
    assert.equal((await client.request("GET", "/CHARACTERS/1")).status, 200);
  });
});
