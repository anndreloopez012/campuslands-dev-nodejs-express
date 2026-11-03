import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import { db, resetDb } from "../src/datos/db.js";
import { registro } from "../src/http/middlewares.js";

beforeEach(() => resetDb());

const accion = (partida, gamertag, que, body) => request(app).post(`/api/partidas/${partida}/jugadores/${gamertag}/${que}`).send(body);

describe("los errores del dominio salen como Problem Details", () => {
    it("INVENTARIO_LLENO -> 422 con todos los campos del estandar y los detalles", async () => {
        for (const itemId of [1, 2, 5, 6, 7]) {
            await accion(1, "Raven", "recoger", { itemId });
        }
        const res = await accion(1, "Raven", "recoger", { itemId: 8 });

        assert.equal(res.status, 422);
        assert.match(res.headers["content-type"], /application\/problem\+json/);
        assert.deepEqual(res.body, {
            type: "/api/errores/inventario-lleno",
            title: "Inventario lleno",
            status: 422,
            detail: "Raven ya tiene 5 de 5 espacios ocupados",
            instance: "/api/partidas/1/jugadores/Raven/recoger",
            code: "INVENTARIO_LLENO",
            requestId: res.headers["x-request-id"],
            capacidad: 5,
            ocupados: 5
        });
    });

    // cada familia con su status
    const casos = [
        ["NoEncontrado -> 404", () => request(app).get("/api/partidas/9"), 404, "PARTIDA_NO_ENCONTRADA"],
        ["NoEncontrado -> 404", () => accion(1, "Nadie", "recoger", { itemId: 1 }), 404, "JUGADOR_NO_ENCONTRADO"],
        ["EstadoInvalido -> 409", () => accion(2, "Hawk", "recoger", { itemId: 1 }), 409, "PARTIDA_NO_EN_CURSO"],
        ["ReglaDelJuego -> 422", () => accion(1, "Raven", "usar", { itemId: 5 }), 422, "ITEM_NO_EN_INVENTARIO"],
        ["DatosInvalidos -> 400", () => accion(1, "Raven", "recoger", { itemId: "uno" }), 400, "DATOS_INVALIDOS"]
    ];

    for (const [nombre, hacer, status, code] of casos) {
        it(`${nombre} (${code})`, async () => {
            const res = await hacer();
            assert.equal(res.status, status);
            assert.equal(res.body.code, code);
            assert.equal(res.body.status, status);
        });
    }

    it("Conflicto -> 409 con quien recogio el item", async () => {
        await accion(1, "Raven", "recoger", { itemId: 2 });
        const res = await accion(1, "Wolf", "recoger", { itemId: 2 });

        assert.equal(res.status, 409);
        assert.equal(res.body.code, "ITEM_YA_RECOGIDO");
        assert.equal(res.body.recogidoPor, "Raven");
    });

    it("DATOS_INVALIDOS trae la lista de errores", async () => {
        const res = await accion(1, "Raven", "disparar", { armaId: -1 });
        assert.deepEqual(res.body.errores, ["armaId debe ser un entero positivo", "objetivo es obligatorio"]);
    });

    it("JSON roto tambien sale como DATOS_INVALIDOS", async () => {
        const res = await request(app).post("/api/partidas/1/jugadores/Raven/recoger").set("Content-Type", "application/json").send("{mal");
        assert.equal(res.status, 400);
        assert.equal(res.body.code, "DATOS_INVALIDOS");
    });

    it("ruta que no existe tambien en formato problem", async () => {
        const res = await request(app).delete("/api/partidas/1");
        assert.equal(res.status, 404);
        assert.equal(res.body.code, "RUTA_NO_ENCONTRADA");
        assert.match(res.headers["content-type"], /problem\+json/);
    });
});

describe("errores que no son del dominio (bugs)", () => {
    it("500 sin filtrar el mensaje real, y se registra con el requestId", async (t) => {
        // simulo un bug: la base de datos tira un error que nadie esperaba
        t.mock.method(db.partidas, "get", () => {
            throw new TypeError("Cannot read properties of undefined (reading 'secreto_interno')");
        });

        const res = await request(app).get("/api/partidas/1");

        assert.equal(res.status, 500);
        assert.equal(res.body.code, "ERROR_INTERNO");
        assert.doesNotMatch(JSON.stringify(res.body), /secreto_interno|TypeError/);

        const log = registro.find((r) => r.requestId === res.body.requestId);
        assert.match(log.mensaje, /secreto_interno/);
    });
});

describe("catalogo de errores", () => {
    it("GET /api/errores lista cada code con su status", async () => {
        const res = await request(app).get("/api/errores");
        const inventario = res.body.data.find((e) => e.code === "INVENTARIO_LLENO");

        assert.equal(res.body.data.length, 15);
        assert.deepEqual(inventario, {
            code: "INVENTARIO_LLENO",
            type: "/api/errores/inventario-lleno",
            status: 422,
            titulo: "Inventario lleno",
            descripcion: "El inventario tiene 5 espacios. Hay que usar algo antes de recoger mas."
        });
    });

    it("el type de un problema se puede abrir y explica el error", async () => {
        const problema = await accion(1, "Raven", "usar", { itemId: 5 });
        const doc = await request(app).get(problema.body.type);

        assert.equal(doc.status, 200);
        assert.equal(doc.body.data.code, "ITEM_NO_EN_INVENTARIO");
    });

    it("todos los errores tienen status y ninguno queda en 500", async () => {
        const res = await request(app).get("/api/errores");
        for (const e of res.body.data) {
            assert.ok([400, 404, 409, 422].includes(e.status), `${e.code} tiene status ${e.status}`);
        }
    });
});

describe("partida completa por HTTP", () => {
    it("recoger, curarse, disparar y ganar", async () => {
        await accion(1, "Raven", "recoger", { itemId: 2 });
        await accion(1, "Raven", "recoger", { itemId: 3 });

        await accion(1, "Raven", "disparar", { objetivo: "Wolf", armaId: 2 });
        const baja = await accion(1, "Raven", "disparar", { objetivo: "Wolf", armaId: 2 });
        assert.equal(baja.body.data.objetivo.vivo, false);

        await accion(1, "Raven", "disparar", { objetivo: "Ghost", armaId: 2 });
        const final = await accion(1, "Raven", "disparar", { objetivo: "Ghost", armaId: 2 });

        assert.equal(final.body.data.estado, "terminada");
        assert.equal(final.body.data.ganador, "Raven");
    });
});
