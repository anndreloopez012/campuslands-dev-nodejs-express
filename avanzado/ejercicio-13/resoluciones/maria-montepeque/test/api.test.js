import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";
import { crearLogger, OCULTO } from "../src/logs/logger.js";

function appConLogs(opciones = {}) {
    const lineas = [];
    const logger = crearLogger({ nivel: "debug", destino: (l) => lineas.push(JSON.parse(l)) });
    return { app: crearApp({ logger, ...opciones }), lineas };
}

// el log de acceso se escribe en "finish", le doy un instante
const esperar = () => new Promise((r) => setTimeout(r, 10));
const mision = { nave: "Nostromo", destino: "marte", tripulantes: 7, codigoAcceso: "MU-TH-UR-6000" };

describe("logs de cada peticion", () => {
    it("todas las lineas de una peticion comparten el mismo requestId, tambien las del service", async () => {
        const { app, lineas } = appConLogs();
        const res = await request(app).post("/api/misiones").send(mision);
        await esperar();

        const id = res.headers["x-request-id"];
        const deEsta = lineas.filter((l) => l.requestId === id);

        assert.deepEqual(deEsta.map((l) => l.msg), ["calculando trayectoria", "mision creada", "peticion terminada"]);
    });

    it("la linea de acceso trae metodo, ruta, status y duracion", async () => {
        const { app, lineas } = appConLogs();
        await request(app).get("/health");
        await esperar();

        const acceso = lineas.find((l) => l.msg === "peticion terminada");
        assert.equal(acceso.level, "info");
        assert.equal(acceso.metodo, "GET");
        assert.equal(acceso.ruta, "/health");
        assert.equal(acceso.status, 200);
        assert.equal(typeof acceso.duracionMs, "number");
    });

    it("reusa el X-Request-Id que manda otro servicio (para seguir una peticion entre servicios)", async () => {
        const { app, lineas } = appConLogs();
        const res = await request(app).get("/health").set("X-Request-Id", "gateway-12345678");
        await esperar();

        assert.equal(res.headers["x-request-id"], "gateway-12345678");
        assert.equal(lineas.at(-1).requestId, "gateway-12345678");
    });

    it("dos peticiones al mismo tiempo no mezclan sus requestId", async () => {
        const { app, lineas } = appConLogs();
        const [a, b] = await Promise.all([
            request(app).post("/api/misiones").send(mision),
            request(app).post("/api/misiones").send({ ...mision, destino: "luna" })
        ]);
        await esperar();

        for (const res of [a, b]) {
            const creada = lineas.find((l) => l.msg === "mision creada" && l.requestId === res.headers["x-request-id"]);
            assert.equal(creada.misionId, res.body.data.id);
        }
    });
});

describe("niveles segun lo que paso", () => {
    it("4xx se loguea como warn y no guarda el codigoAcceso", async () => {
        const { app, lineas } = appConLogs();
        await request(app).post("/api/misiones").send({ nave: "X", destino: "pluton", codigoAcceso: "super-secreto" });
        await esperar();

        const rechazo = lineas.find((l) => l.msg === "mision rechazada por datos invalidos");
        assert.equal(rechazo.level, "warn");
        assert.equal(rechazo.body.codigoAcceso, OCULTO);
        assert.equal(lineas.at(-1).level, "warn");
        assert.equal(lineas.at(-1).status, 400);
        // en ningun lado del log aparece el secreto
        assert.doesNotMatch(JSON.stringify(lineas), /super-secreto/);
    });

    it("el header Authorization no queda en el log", async () => {
        const { app, lineas } = appConLogs();
        await request(app).get("/health").set("Authorization", "Bearer token-real-123");
        await esperar();

        assert.equal(lineas.at(-1).headers.authorization, OCULTO);
        assert.doesNotMatch(JSON.stringify(lineas), /token-real-123/);
    });

    it("un 500: el stack va al log, la respuesta solo trae el requestId", async () => {
        const { app, lineas } = appConLogs();
        const res = await request(app).post("/api/misiones").send({ ...mision, destino: "agujero-negro" });
        await esperar();

        assert.equal(res.status, 500);
        assert.doesNotMatch(JSON.stringify(res.body), /horizonteDeEventos|TypeError/);

        const error = lineas.find((l) => l.msg === "error no controlado");
        assert.equal(error.level, "error");
        assert.equal(error.requestId, res.body.requestId);
        assert.match(error.error.stack, /horizonteDeEventos/);
        assert.equal(lineas.at(-1).level, "error");
    });

    it("una peticion lenta se marca como warn aunque sea 200", async () => {
        const { app, lineas } = appConLogs({ umbralLentoMs: 20 });
        await request(app).get("/api/telemetria?esperaMs=40");
        await esperar();

        assert.equal(lineas.at(-1).level, "warn");
        assert.equal(lineas.at(-1).lenta, true);
    });

    it("con nivel warn no salen los info ni debug", async () => {
        const lineas = [];
        const app = crearApp({ logger: crearLogger({ nivel: "warn", destino: (l) => lineas.push(JSON.parse(l)) }) });
        await request(app).post("/api/misiones").send(mision);
        await request(app).get("/api/misiones/99");
        await esperar();

        assert.deepEqual(lineas.map((l) => [l.level, l.status]), [["warn", 404]]);
    });
});
