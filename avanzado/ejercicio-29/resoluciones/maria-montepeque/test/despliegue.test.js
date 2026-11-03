import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import request from "supertest";
import { crearApp, crearBaseSimulada } from "../src/app.js";
import { ErrorConfig, leerConfig } from "../src/config.js";
import { verificarDespliegue } from "../scripts/verificar-despliegue.js";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const configTest = (env = {}) => leerConfig({ NODE_ENV: "test", ...env });

function preparar(env, opciones = {}) {
    const logs = [];
    const base = crearBaseSimulada();
    const app = crearApp(configTest(env), { base, escribirLog: (l) => logs.push(l), ...opciones });
    return { app, logs, base };
}

describe("config", () => {
    it("en production exige DATABASE_URL y GIT_SHA", () => {
        assert.throws(() => leerConfig({ NODE_ENV: "production" }), (err) => err instanceof ErrorConfig && /DATABASE_URL/.test(err.message) && /GIT_SHA/.test(err.message));
        assert.equal(leerConfig({ NODE_ENV: "production", DATABASE_URL: "postgres://x", GIT_SHA: "abc" }).produccion, true);
    });

    it("rechaza puertos raros", () => {
        assert.throws(() => leerConfig({ PORT: "99999" }), /PORT/);
    });
});

describe("salud", () => {
    it("live siempre responde, ready revisa la base de datos", async () => {
        const { app, base } = preparar();
        assert.equal((await request(app).get("/health/live")).status, 200);

        const bien = await request(app).get("/health/ready");
        assert.equal(bien.status, 200);
        assert.equal(bien.body.dependencias[0].nombre, "base-de-datos");

        base.simularCaida();
        const mal = await request(app).get("/health/ready");
        assert.equal(mal.status, 503);
        assert.equal(mal.body.dependencias[0].error, "conexion rechazada");
        assert.equal((await request(app).get("/health/live")).status, 200);
    });

    it("una dependencia que no responde se corta por timeout (no cuelga el ready)", async () => {
        const { app, base } = preparar();
        base.simularLentitud(2000);
        const inicio = Date.now();
        const res = await request(app).get("/health/ready");
        assert.equal(res.status, 503);
        assert.match(res.body.dependencias[0].error, /no respondio en 500 ms/);
        assert.ok(Date.now() - inicio < 1500);
    });

    it("al apagar, ready dice 503 aunque todo este bien", async () => {
        const { app } = preparar();
        app.locals.salud.marcarApagando();
        const res = await request(app).get("/health/ready");
        assert.deepEqual([res.status, res.body.apagando], [503, true]);
    });

    it("/version dice que commit esta corriendo", async () => {
        const { app } = preparar({ GIT_SHA: "9f8e7d6" });
        const { body } = await request(app).get("/version");
        assert.deepEqual([body.nombre, body.commit, body.entorno], ["avanzado-ejercicio-29-maria-montepeque", "9f8e7d6", "test"]);
    });
});

describe("listo para produccion", () => {
    it("cabeceras de seguridad, sin X-Powered-By y con X-Request-Id", async () => {
        const { app } = preparar();
        const res = await request(app).get("/api/futbol/tabla");
        assert.equal(res.headers["x-powered-by"], undefined);
        assert.equal(res.headers["x-content-type-options"], "nosniff");
        assert.match(res.headers["x-request-id"], /^[\w-]{8,}$/);
        // si el proxy manda uno, se respeta
        assert.equal((await request(app).get("/health").set("X-Request-Id", "desde-nginx-123")).headers["x-request-id"], "desde-nginx-123");
    });

    it("log de acceso en JSON con requestId, status y tiempo", async () => {
        const { app, logs } = preparar();
        const res = await request(app).get("/api/no-existe/tabla");
        const linea = logs.at(-1);
        assert.deepEqual([linea.nivel, linea.status, linea.ruta, linea.requestId], ["warn", 404, "/api/no-existe/tabla", res.headers["x-request-id"]]);
        assert.equal(typeof linea.ms, "number");
    });

    it("limite por ip: 429 con Retry-After, pero la salud no cuenta", async () => {
        const { app } = preparar({ LIMITE_POR_MINUTO: "3" }, { reloj: () => 1_000_000_000 });
        for (let i = 0; i < 3; i++) assert.equal((await request(app).get("/api/futbol/tabla")).status, 200);
        const bloqueada = await request(app).get("/api/futbol/tabla");
        assert.equal(bloqueada.status, 429);
        assert.ok(Number(bloqueada.headers["retry-after"]) > 0);
        assert.equal((await request(app).get("/health/ready")).status, 200);
    });

    it("body roto da 400 y un body de mas de 10kb da 413", async () => {
        const { app } = preparar();
        const roto = await request(app).post("/api/partidos").set("Content-Type", "application/json").send('{"modalidad": ');
        assert.equal(roto.status, 400);
        const grande = await request(app).post("/api/partidos").set("Content-Type", "application/json").send(JSON.stringify({ x: "a".repeat(20_000) }));
        assert.equal(grande.status, 413);
    });
});

describe("liga", () => {
    it("tabla de futbol sala: puntos, diferencia de gol y orden", async () => {
        const { app } = preparar();
        const jugar = (local, visitante, golesLocal, golesVisitante) => request(app).post("/api/partidos").send({ modalidad: "futbol-sala", local, visitante, golesLocal, golesVisitante });
        await jugar("Glucosoral", "Bizcocho FS", 5, 2);
        await jugar("Rayo Sala", "Caja Futsal", 3, 3);
        await jugar("Bizcocho FS", "Rayo Sala", 6, 1);

        const tabla = (await request(app).get("/api/futbol-sala/tabla")).body.data;
        // empatan a 3 puntos: gana Glucosoral por diferencia de gol (+3 contra +2)
        assert.deepEqual(tabla.map((f) => [f.posicion, f.equipo, f.pts, f.dg]), [[1, "Glucosoral", 3, 3], [2, "Bizcocho FS", 3, 2], [3, "Caja Futsal", 1, 0], [4, "Rayo Sala", 1, -5]]);
    });

    it("400 si el equipo no es de esa modalidad", async () => {
        const { app } = preparar();
        const res = await request(app).post("/api/partidos").send({ modalidad: "futbol", local: "Glucosoral", visitante: "Municipal", golesLocal: 1, golesVisitante: 0 });
        assert.equal(res.status, 400);
        assert.match(res.body.errors[0], /local no es un equipo de futbol/);
    });
});

describe("checklist de despliegue", () => {
    it("este proyecto pasa todo con la config de produccion", () => {
        const { ok, chequeos } = verificarDespliegue(RAIZ, { DATABASE_URL: "postgres://x", GIT_SHA: "abc123" });
        assert.deepEqual(chequeos.filter((c) => !c.ok), []);
        assert.equal(ok, true);
    });

    it("un proyecto mal preparado falla en lo que corresponde", async () => {
        const carpeta = await mkdtemp(path.join(tmpdir(), "deploy-test-"));
        try {
            await writeFile(path.join(carpeta, "package.json"), JSON.stringify({ scripts: { start: "nodemon index.js" }, dependencies: { supertest: "1" } }));
            await writeFile(path.join(carpeta, "Dockerfile"), "FROM node\nRUN npm install\nCMD npm start\n");
            const { ok, chequeos } = verificarDespliegue(carpeta, {});
            const fallas = chequeos.filter((c) => !c.ok).map((c) => c.nombre);
            assert.equal(ok, false);
            for (const esperado of ["package.json tiene engines.node", "npm start no usa --watch ni nodemon", "Dockerfile no corre como root", "Dockerfile tiene HEALTHCHECK", "config de production valida"]) {
                assert.ok(fallas.includes(esperado), esperado);
            }
        } finally {
            await rm(carpeta, { recursive: true, force: true });
        }
    });
});
