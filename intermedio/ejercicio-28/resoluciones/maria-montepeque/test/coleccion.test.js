import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import app from "../src/app.js";
import router from "../src/routes/index.js";
import { correrArchivoHttp } from "../scripts/correr-http.js";
import { leerArchivoHttp, leerJsonPath } from "../scripts/leer-http.js";

// la coleccion es parte de la entrega: si un ejemplo deja de funcionar, falla el test

const carpetaHttp = new URL("../http/", import.meta.url);
const archivosHttp = readdirSync(carpetaHttp).filter((f) => f.endsWith(".http")).sort();
const postman = JSON.parse(readFileSync(new URL("../postman/battle-royale.postman_collection.json", import.meta.url), "utf8"));

let servidor;
let baseUrl;

before(async () => {
    servidor = app.listen(0);
    await new Promise((resolve) => servidor.once("listening", resolve));
    baseUrl = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

describe("coleccion .http", () => {
    for (const archivo of archivosHttp) {
        it(`${archivo}: cada peticion da el status de "# espera:"`, async () => {
            const resultados = await correrArchivoHttp(new URL(archivo, carpetaHttp), baseUrl);
            const malos = resultados.filter((r) => !r.ok).map((r) => `${r.peticion} dio ${r.status}, esperaba ${r.espera}`);

            assert.ok(resultados.length > 0);
            assert.deepEqual(malos, []);
        });

        it(`${archivo}: todas las peticiones dicen que status esperan`, () => {
            const sinEspera = leerArchivoHttp(new URL(archivo, carpetaHttp)).filter((p) => p.metodo && p.espera === null);
            assert.deepEqual(sinEspera.map((p) => `${p.metodo} ${p.url}`), []);
        });
    }

    it("la partida completa termina con Cuervos de ganador", async () => {
        const resultados = await correrArchivoHttp(new URL("03-partida-completa.http", carpetaHttp), baseUrl);
        const ranking = resultados.find((r) => r.peticion.endsWith("/ranking"));

        assert.equal(ranking.body.data.ganador, "Cuervos");
        assert.equal(ranking.body.data.jugadores.length, 3);
    });

    it("cada ruta de la API sale en algun .http", () => {
        // GET /api/partidas/:id -> regex que acepta /api/partidas/1 o /api/partidas/{{x}}
        const rutas = router.stack
            .filter((capa) => capa.route)
            .flatMap((capa) => Object.keys(capa.route.methods).map((m) => ({ metodo: m.toUpperCase(), ruta: `/api${capa.route.path}` })));

        const usadas = archivosHttp
            .flatMap((f) => leerArchivoHttp(new URL(f, carpetaHttp)))
            .filter((p) => p.metodo)
            .map((p) => `${p.metodo} ${p.url.replace("{{baseUrl}}", "")}`);

        const sinEjemplo = rutas.filter(({ metodo, ruta }) => {
            const patron = new RegExp(`^${metodo} ${ruta.replace(/:\w+/g, "[^/]+")}$`);
            return !usadas.some((u) => patron.test(u));
        });

        assert.deepEqual(sinEjemplo, []);
    });
});

describe("lector de .http", () => {
    it("lee variables, nombre, espera, headers y body", () => {
        const pasos = leerArchivoHttp(new URL("01-auth.http", carpetaHttp));
        const login = pasos.find((p) => p.nombre === "login");

        assert.deepEqual(pasos[0].variables, [["baseUrl", "http://localhost:3028"]]);
        assert.equal(login.metodo, "POST");
        assert.equal(login.espera, 200);
        assert.equal(login.headers["Content-Type"], "application/json");
        assert.deepEqual(JSON.parse(login.body), { gamertag: "Raven" });
    });

    it("leerJsonPath entiende puntos y corchetes", () => {
        const objeto = { data: { jugadores: [{ gamertag: "Hawk" }] } };
        assert.equal(leerJsonPath(objeto, "$.data.jugadores[0].gamertag"), "Hawk");
        assert.equal(leerJsonPath(objeto, "$.data.nada.otra"), undefined);
    });
});

describe("coleccion de Postman", () => {
    const peticiones = postman.item.flatMap((carpeta) => carpeta.item);

    it("usa el formato v2.1 y la variable baseUrl", () => {
        assert.match(postman.info.schema, /v2\.1\.0/);
        assert.ok(postman.variable.some((v) => v.key === "baseUrl"));
    });

    for (const p of peticiones) {
        it(`"${p.name}" revisa el status en un test`, () => {
            const test = p.event?.find((e) => e.listen === "test");
            assert.ok(test, "falta el script de test");
            assert.match(test.script.exec.join("\n"), /to\.have\.status\(\d{3}\)/);
        });
    }

    it("las variables que se usan se guardan antes en algun test", () => {
        const texto = JSON.stringify(postman.item);
        const usadas = new Set([...texto.matchAll(/\{\{(\w+)\}\}/g)].map((m) => m[1]));
        const guardadas = new Set([...texto.matchAll(/collectionVariables\.set\('(\w+)'/g)].map((m) => m[1]));

        for (const variable of usadas) {
            if (variable === "baseUrl") continue;
            assert.ok(guardadas.has(variable), `${variable} se usa pero nunca se guarda`);
        }
    });
});
