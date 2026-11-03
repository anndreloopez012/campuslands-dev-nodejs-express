import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { resetDb } from "../src/data/db.js";

beforeEach(() => resetDb());

describe("descubrir versiones", () => {
    it("GET /api lista las versiones y cual es la actual", async () => {
        const res = await request(app).get("/api");

        assert.equal(res.status, 200);
        assert.equal(res.body.actual, "v2");
        assert.deepEqual(res.body.versiones.map((v) => [v.version, v.estado]), [["v1", "deprecada"], ["v2", "actual"]]);
    });

    it("una version que no existe da 404 con las que si hay", async () => {
        const res = await request(app).get("/api/v3/personajes");

        assert.equal(res.status, 404);
        assert.equal(res.body.message, "La version v3 no existe");
        assert.deepEqual(res.body.versiones, ["v1", "v2"]);
    });
});

describe("v1 (deprecada)", () => {
    it("responde el arreglo directo con hp y mp", async () => {
        const res = await request(app).get("/api/v1/personajes");

        assert.equal(res.status, 200);
        assert.ok(Array.isArray(res.body));
        assert.deepEqual(res.body[0], { id: 1, nombre: "Aldric", clase: "guerrero", nivel: 12, hp: 340, mp: 40 });
    });

    it("manda los headers de deprecacion con el link a la misma ruta en v2", async () => {
        const res = await request(app).get("/api/v1/personajes/2");

        assert.equal(res.headers["api-version"], "1");
        assert.equal(res.headers.deprecation, "true");
        assert.equal(res.headers.sunset, "Wed, 30 Jun 2027 00:00:00 GMT");
        assert.equal(res.headers.link, '</api/v2/personajes/2>; rel="successor-version"');
    });

    it("crea con nombre y clase", async () => {
        const res = await request(app).post("/api/v1/personajes").send({ nombre: "Kael", clase: "maga" });

        assert.equal(res.status, 201);
        assert.deepEqual(res.body, { id: 6, nombre: "Kael", clase: "maga", nivel: 1, hp: 90, mp: 140 });
    });

    it("errores en el formato viejo { error }", async () => {
        const sinNombre = await request(app).post("/api/v1/personajes").send({ clase: "maga" });
        assert.equal(sinNombre.status, 400);
        assert.deepEqual(sinNombre.body, { error: "nombre debe tener al menos 3 letras" });

        const noExiste = await request(app).get("/api/v1/personajes/99");
        assert.deepEqual(noExiste.body, { error: "No existe el personaje con id 99" });

        const jsonRoto = await request(app).post("/api/v1/personajes").set("Content-Type", "application/json").send("{mal");
        assert.deepEqual(jsonRoto.body, { error: "JSON invalido" });
    });

    it("subir-nivel no existe en v1", async () => {
        const res = await request(app).post("/api/v1/personajes/1/subir-nivel");

        assert.equal(res.status, 404);
        assert.match(res.body.error, /no existe en v1/);
    });
});

describe("v2 (actual)", () => {
    it("lista con { ok, data, meta, links } y stats agrupados", async () => {
        const res = await request(app).get("/api/v2/personajes");

        assert.equal(res.status, 200);
        assert.equal(res.headers["api-version"], "2");
        assert.equal(res.headers.deprecation, undefined);
        assert.deepEqual(res.body.meta, { page: 1, limit: 10, total: 5, totalPages: 1 });
        assert.deepEqual(res.body.data[0].stats, { vida: 340, mana: 40, fuerza: 28 });
        assert.equal(res.body.data[0].links.self, "/api/v2/personajes/1");
    });

    it("paginacion con links next y prev que mantienen los filtros", async () => {
        const pag1 = await request(app).get("/api/v2/personajes?limit=2");
        assert.equal(pag1.body.links.next, "/api/v2/personajes?limit=2&page=2");
        assert.equal(pag1.body.links.prev, null);

        const pag3 = await request(app).get("/api/v2/personajes?limit=2&page=3");
        assert.deepEqual(pag3.body.data.map((p) => p.id), [5]);
        assert.equal(pag3.body.links.next, null);
        assert.equal(pag3.body.links.prev, "/api/v2/personajes?limit=2&page=2");

        const guerreros = await request(app).get("/api/v2/personajes?clase=guerrero&limit=1");
        assert.equal(guerreros.body.links.next, "/api/v2/personajes?clase=guerrero&limit=1&page=2");
    });

    it("crea con fuerzaExtra, 201 y Location", async () => {
        const res = await request(app).post("/api/v2/personajes").send({ nombre: "Kael", clase: "arquero", stats: { fuerzaExtra: 3 } });

        assert.equal(res.status, 201);
        assert.equal(res.headers.location, "/api/v2/personajes/6");
        assert.deepEqual(res.body.data.stats, { vida: 110, mana: 50, fuerza: 14 });
    });

    it("errores en el formato nuevo, con todos juntos", async () => {
        const res = await request(app).post("/api/v2/personajes").send({ nombre: "X", clase: "ninja", stats: { fuerzaExtra: 9 } });

        assert.equal(res.status, 400);
        assert.deepEqual(res.body, {
            ok: false,
            message: "Datos invalidos",
            errors: [
                "nombre debe tener entre 3 y 20 letras",
                "clase debe ser una de: guerrero, maga, arquero, clerigo",
                "stats.fuerzaExtra debe ser un entero de 0 a 5"
            ]
        });
    });

    it("subir-nivel es nuevo en v2", async () => {
        const res = await request(app).post("/api/v2/personajes/2/subir-nivel");

        assert.equal(res.status, 200);
        assert.equal(res.body.data.nivel, 10);
        assert.deepEqual(res.body.data.stats, { vida: 156, mana: 234, fuerza: 8 });
    });

    for (const [ruta, status] of [
        ["/api/v2/personajes?page=0", 400],
        ["/api/v2/personajes?limit=100", 400],
        ["/api/v2/personajes?clase=ninja", 400],
        ["/api/v2/personajes/abc", 400],
        ["/api/v2/personajes/99", 404]
    ]) {
        it(`${ruta} da ${status}`, async () => {
            const res = await request(app).get(ruta);
            assert.equal(res.status, status);
            assert.equal(res.body.ok, false);
        });
    }
});

describe("las dos versiones comparten los datos", () => {
    it("lo que se crea en v1 se ve en v2 con su formato", async () => {
        await request(app).post("/api/v1/personajes").send({ nombre: "Kael", clase: "clerigo" });

        const v2 = await request(app).get("/api/v2/personajes/6");
        assert.equal(v2.body.data.nombre, "Kael");
        assert.deepEqual(v2.body.data.stats, { vida: 120, mana: 110, fuerza: 8 });
    });

    it("subir de nivel en v2 tambien cambia lo que muestra v1", async () => {
        await request(app).post("/api/v2/personajes/1/subir-nivel");

        const v1 = await request(app).get("/api/v1/personajes/1");
        assert.equal(v1.body.nivel, 13);
        assert.equal(v1.body.hp, 358);
    });

    it("nombre repetido da 409 en las dos, cada una con su formato", async () => {
        const v1 = await request(app).post("/api/v1/personajes").send({ nombre: "aldric", clase: "maga" });
        const v2 = await request(app).post("/api/v2/personajes").send({ nombre: "ALDRIC", clase: "maga" });

        assert.equal(v1.status, 409);
        assert.equal(v2.status, 409);
        assert.ok(v1.body.error);
        assert.equal(v2.body.ok, false);
    });
});
