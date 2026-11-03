import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";
import { openapi } from "../src/docs/openapi.js";
import { validar } from "../src/docs/validador.js";

// rutas que no son de la API (son la documentacion misma)
const SIN_DOCUMENTAR = ["GET /openapi.json", "GET /docs"];

// lee las rutas registradas en express 4
function rutasDeExpress(app) {
    return app._router.stack
        .filter((capa) => capa.route)
        .flatMap((capa) => Object.keys(capa.route.methods).map((m) => `${m.toUpperCase()} ${capa.route.path}`));
}

// "/api/compuestos/{formula}" -> "/api/compuestos/:formula"
const rutasDelOpenapi = () => Object.entries(openapi.paths).flatMap(([ruta, metodos]) => Object.keys(metodos).map((m) => `${m.toUpperCase()} ${ruta.replace(/\{(\w+)\}/g, ":$1")}`));

// revisa que la respuesta real cumpla con lo que dice la documentacion
function cumpleContrato(metodo, rutaOpenapi, res) {
    const respuesta = openapi.paths[rutaOpenapi][metodo].responses[res.status];
    assert.ok(respuesta, `${metodo.toUpperCase()} ${rutaOpenapi} respondio ${res.status} pero ese status no esta documentado`);
    const errores = validar(openapi, respuesta.content["application/json"].schema, res.body, "respuesta");
    assert.deepEqual(errores, [], `la respuesta no cumple el schema: ${errores.join("; ")}`);
}

describe("la documentacion esta completa", () => {
    it("todas las rutas de express estan en el OpenAPI y al reves", () => {
        const deExpress = rutasDeExpress(crearApp()).filter((r) => !SIN_DOCUMENTAR.includes(r)).sort();
        assert.deepEqual(deExpress, rutasDelOpenapi().sort());
    });

    it("cada operacion tiene summary, operationId unico, tags conocidos y respuestas", () => {
        const ids = new Set();
        const tags = openapi.tags.map((t) => t.name);
        for (const [ruta, metodos] of Object.entries(openapi.paths)) {
            for (const [metodo, op] of Object.entries(metodos)) {
                const donde = `${metodo} ${ruta}`;
                assert.ok(op.summary, `${donde} sin summary`);
                assert.ok(!ids.has(op.operationId), `${donde} operationId repetido`);
                ids.add(op.operationId);
                assert.ok(op.tags.every((t) => tags.includes(t)), `${donde} tag desconocido`);
                assert.ok(Object.keys(op.responses).length > 0, `${donde} sin respuestas`);
            }
        }
    });

    it("todos los $ref apuntan a algo que existe y los ejemplos cumplen su schema", () => {
        const texto = JSON.stringify(openapi);
        for (const [, ref] of texto.matchAll(/"\$ref":"([^"]+)"/g)) {
            assert.ok(ref.replace("#/", "").split("/").reduce((o, p) => o?.[p], openapi), `ref roto ${ref}`);
        }
        for (const metodos of Object.values(openapi.paths)) {
            for (const op of Object.values(metodos)) {
                const contenido = op.requestBody?.content["application/json"];
                if (contenido?.example) assert.deepEqual(validar(openapi, contenido.schema, contenido.example), []);
            }
        }
    });
});

describe("las respuestas reales cumplen lo documentado", () => {
    const app = crearApp();

    it("GET /health", async () => cumpleContrato("get", "/health", await request(app).get("/health")));

    it("GET /api/compuestos (200 y 400)", async () => {
        cumpleContrato("get", "/api/compuestos", await request(app).get("/api/compuestos"));
        cumpleContrato("get", "/api/compuestos", await request(app).get("/api/compuestos?tipo=acido"));
        cumpleContrato("get", "/api/compuestos", await request(app).get("/api/compuestos?tipo=metal"));
    });

    it("GET /api/compuestos/{formula} (200 y 404)", async () => {
        cumpleContrato("get", "/api/compuestos/{formula}", await request(app).get(`/api/compuestos/${encodeURIComponent("Ca(OH)2")}`));
        cumpleContrato("get", "/api/compuestos/{formula}", await request(app).get("/api/compuestos/XeF4"));
    });

    it("POST /api/compuestos (201, 400 y 409)", async () => {
        const nuevo = { formula: "NaHCO3", nombre: "Bicarbonato de sodio", tipo: "sal" };
        const creado = await request(crearApp()).post("/api/compuestos").send(nuevo);
        assert.equal(creado.status, 201);
        cumpleContrato("post", "/api/compuestos", creado);
        cumpleContrato("post", "/api/compuestos", await request(app).post("/api/compuestos").send({ formula: "H2O", nombre: "Agua", tipo: "oxido" }));
        cumpleContrato("post", "/api/compuestos", await request(app).post("/api/compuestos").send({ formula: "NaCl" }));
    });

    it("POST /api/masa-molar (200 y 400)", async () => {
        const ok = await request(app).post("/api/masa-molar").send({ formula: "Al2(SO4)3" });
        assert.equal(ok.body.data.masaMolar, 342.132);
        cumpleContrato("post", "/api/masa-molar", ok);
        cumpleContrato("post", "/api/masa-molar", await request(app).post("/api/masa-molar").send({ formula: "Qq" }));
    });
});

describe("validacion con el mismo schema de la documentacion", () => {
    it("400 con la lista de errores del schema", async () => {
        const res = await request(crearApp()).post("/api/compuestos").send({ formula: "NaCl", tipo: "metal", extra: 1 });
        assert.equal(res.status, 400);
        assert.deepEqual(res.body.errors.sort(), ["body.extra no esta permitido", "body.nombre es obligatorio", "body.tipo debe ser uno de: acido, base, sal, oxido, organico"]);
    });

    it("tipos equivocados", async () => {
        const res = await request(crearApp()).post("/api/masa-molar").send({ formula: 42 });
        assert.deepEqual(res.body.errors, ["body.formula debe ser string"]);
    });
});

describe("rutas de documentacion", () => {
    it("/openapi.json devuelve la especificacion y /docs una pagina con cada ruta", async () => {
        const app = crearApp();
        assert.equal((await request(app).get("/openapi.json")).body.openapi, "3.0.3");
        const html = await request(app).get("/docs");
        assert.match(html.headers["content-type"], /text\/html/);
        for (const ruta of Object.keys(openapi.paths)) assert.ok(html.text.includes(ruta), ruta);
    });
});
