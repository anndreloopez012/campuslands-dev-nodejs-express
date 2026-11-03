import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import request from "supertest";
import app from "../src/app.js";
import router from "../src/routes/index.js";

// estos tests revisan que la documentacion no se quede atrasada con el codigo

const openapi = JSON.parse(readFileSync(new URL("../docs/openapi.json", import.meta.url), "utf8"));
const METODOS = ["get", "post", "put", "patch", "delete"];

// "GET /api/equipos/:id" desde el router de express
function rutasDelCodigo() {
    const rutas = [];
    for (const capa of router.stack) {
        if (!capa.route) continue;
        for (const metodo of Object.keys(capa.route.methods)) {
            rutas.push(`${metodo.toUpperCase()} /api${capa.route.path}`);
        }
    }
    return rutas.sort();
}

// "GET /api/equipos/:id" desde openapi, donde se escribe /api/equipos/{id}
function rutasDocumentadas() {
    const rutas = [];
    for (const [ruta, operaciones] of Object.entries(openapi.paths)) {
        for (const metodo of Object.keys(operaciones)) {
            if (!METODOS.includes(metodo)) continue;
            rutas.push(`${metodo.toUpperCase()} ${ruta.replace(/\{(\w+)\}/g, ":$1")}`);
        }
    }
    return rutas.sort();
}

// todas las operaciones del openapi con su ruta y metodo
function operaciones() {
    return Object.entries(openapi.paths).flatMap(([ruta, ops]) =>
        Object.entries(ops)
            .filter(([metodo]) => METODOS.includes(metodo))
            .map(([metodo, op]) => ({ nombre: `${metodo.toUpperCase()} ${ruta}`, ruta, op }))
    );
}

// busca un "$ref" como "#/components/schemas/Equipo" dentro del openapi
function resolverRef(ref) {
    return ref.replace("#/", "").split("/").reduce((obj, parte) => obj?.[parte], openapi);
}

describe("documentacion OpenAPI", () => {
    it("cada ruta del codigo esta documentada y no sobra ninguna", () => {
        assert.deepEqual(rutasDocumentadas(), rutasDelCodigo());
    });

    it("es OpenAPI 3 y tiene titulo y version", () => {
        assert.match(openapi.openapi, /^3\./);
        assert.ok(openapi.info.title);
        assert.ok(openapi.info.version);
    });

    for (const { nombre, ruta, op } of operaciones()) {
        describe(nombre, () => {
            it("tiene summary, tag y operationId", () => {
                assert.ok(op.summary, "falta summary");
                assert.ok(op.tags?.length, "falta tag");
                assert.ok(op.operationId, "falta operationId");
            });

            it("documenta al menos una respuesta 2xx y una de error", () => {
                const codigos = Object.keys(op.responses);
                assert.ok(codigos.some((c) => c.startsWith("2")), "falta respuesta exitosa");
                if (op.parameters?.length || op.requestBody || op.security) {
                    assert.ok(codigos.some((c) => c.startsWith("4")), "falta respuesta de error");
                }
            });

            it("los {parametros} de la ruta estan declarados", () => {
                const enLaRuta = [...ruta.matchAll(/\{(\w+)\}/g)].map((m) => m[1]);
                const declarados = (op.parameters || [])
                    .map((p) => (p.$ref ? resolverRef(p.$ref) : p))
                    .filter((p) => p.in === "path")
                    .map((p) => p.name);
                assert.deepEqual(declarados.sort(), enLaRuta.sort());
            });

            if (op.security) {
                it("si pide api key documenta el 401 y el 403", () => {
                    assert.ok(op.responses["401"]);
                    assert.ok(op.responses["403"]);
                });
            }
        });
    }

    it("todos los $ref apuntan a algo que existe", () => {
        const texto = JSON.stringify(openapi);
        const refs = [...texto.matchAll(/"\$ref":"([^"]+)"/g)].map((m) => m[1]);

        assert.ok(refs.length > 0);
        for (const ref of new Set(refs)) {
            assert.ok(resolverRef(ref), `no existe ${ref}`);
        }
    });

    it("las regiones del enum son las mismas que acepta el service", async () => {
        const { REGIONES } = await import("../src/services/liga.service.js");
        assert.deepEqual(openapi.components.schemas.Region.enum, REGIONES);
    });
});

describe("rutas de la documentacion", () => {
    it("GET /openapi.json devuelve el mismo archivo", async () => {
        const res = await request(app).get("/openapi.json");

        assert.equal(res.status, 200);
        assert.deepEqual(res.body, openapi);
    });

    it("GET /docs/ muestra Swagger UI", async () => {
        const res = await request(app).get("/docs/");

        assert.equal(res.status, 200);
        assert.match(res.headers["content-type"], /text\/html/);
        assert.match(res.text, /swagger-ui/);
    });
});
