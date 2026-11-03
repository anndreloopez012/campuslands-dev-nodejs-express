import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../src/app.js";
import config from "../src/config.js";
import { limpiarCache } from "../src/services/stats.service.js";
import { limpiarPartidas, balancear, MAPAS } from "../src/services/partidas.service.js";

// lo que "responde" el proveedor externo en estos tests
const PROVEEDOR = {
    viper: { kills: 400, muertes: 100, victorias: 30, partidas: 50 }, // kd 4
    nova: { kills: 300, muertes: 100, victorias: 30, partidas: 50 }, // kd 3
    ghost: { kills: 200, muertes: 100, victorias: 20, partidas: 50 }, // kd 2
    rook: { kills: 100, muertes: 100, victorias: 10, partidas: 50 } // kd 1
};

// fetch falso que contesta segun la url, como haria el proveedor de verdad
async function proveedorFalso(url) {
    const tag = decodeURIComponent(String(url).split("/stats/")[1] || "").toLowerCase();
    if (PROVEEDOR[tag]) return Response.json(PROVEEDOR[tag]);
    if (String(url).startsWith("http://notificar.test")) return new Response(null, { status: 204 });
    return Response.json({}, { status: 404 });
}

// la notificacion no se espera, asi que doy una vuelta al event loop
const esperarNotificacion = () => new Promise((resolve) => setImmediate(resolve));

describe("POST /api/partidas", () => {
    const urlOriginal = config.notificarUrl;

    beforeEach(() => {
        limpiarCache();
        limpiarPartidas();
    });

    afterEach(() => {
        config.notificarUrl = urlOriginal;
    });

    it("arma dos equipos balanceados por kd", async (t) => {
        t.mock.method(globalThis, "fetch", proveedorFalso);

        const res = await request(app).post("/api/partidas").send({ jugadores: ["rook", "viper", "ghost", "nova"] });

        assert.equal(res.status, 201);
        // serpiente: viper(4) A, nova(3) B, ghost(2) B, rook(1) A
        assert.deepEqual(res.body.data.equipoA.jugadores.map((j) => j.gamertag), ["viper", "rook"]);
        assert.deepEqual(res.body.data.equipoB.jugadores.map((j) => j.gamertag), ["nova", "ghost"]);
        assert.equal(res.body.data.equipoA.kdPromedio, 2.5);
        assert.equal(res.body.data.equipoB.kdPromedio, 2.5);
    });

    it("el mapa depende de Math.random", async (t) => {
        t.mock.method(globalThis, "fetch", proveedorFalso);

        t.mock.method(Math, "random", () => 0);
        const primero = await request(app).post("/api/partidas").send({ jugadores: ["viper", "nova"] });
        assert.equal(primero.body.data.mapa, MAPAS[0]);

        t.mock.method(Math, "random", () => 0.99);
        const ultimo = await request(app).post("/api/partidas").send({ jugadores: ["viper", "nova"] });
        assert.equal(ultimo.body.data.mapa, MAPAS[MAPAS.length - 1]);
    });

    it("pide las stats una vez por jugador", async (t) => {
        const fetchFalso = t.mock.method(globalThis, "fetch", proveedorFalso);

        await request(app).post("/api/partidas").send({ jugadores: ["viper", "nova", "ghost", "rook"] });

        assert.equal(fetchFalso.mock.callCount(), 4);
    });

    it("si un jugador no existe la partida no se arma", async (t) => {
        t.mock.method(globalThis, "fetch", proveedorFalso);

        const res = await request(app).post("/api/partidas").send({ jugadores: ["viper", "fantasma"] });
        assert.equal(res.status, 404);

        const lista = await request(app).get("/api/partidas");
        assert.equal(lista.body.total, 0);
    });

    it("si el proveedor esta caido responde 502", async (t) => {
        t.mock.method(globalThis, "fetch", async () => {
            throw new TypeError("fetch failed");
        });

        const res = await request(app).post("/api/partidas").send({ jugadores: ["viper", "nova"] });
        assert.equal(res.status, 502);
    });

    it("notifica la partida si hay NOTIFICAR_URL", async (t) => {
        const fetchFalso = t.mock.method(globalThis, "fetch", proveedorFalso);
        config.notificarUrl = "http://notificar.test/partidas";

        const res = await request(app).post("/api/partidas").send({ jugadores: ["viper", "nova"] });
        await esperarNotificacion();

        // 2 stats + 1 notificacion
        assert.equal(fetchFalso.mock.callCount(), 3);
        const [url, opciones] = fetchFalso.mock.calls[2].arguments;
        assert.equal(url, "http://notificar.test/partidas");
        assert.equal(opciones.method, "POST");
        assert.deepEqual(JSON.parse(opciones.body), { evento: "partida_creada", partida: res.body.data });
    });

    it("si la notificacion falla la partida igual se crea y queda un aviso", async (t) => {
        t.mock.method(globalThis, "fetch", async (url) => {
            if (String(url).startsWith("http://notificar.test")) throw new TypeError("fetch failed");
            return proveedorFalso(url);
        });
        // tambien mockeo console.warn para que no ensucie la salida y poder revisarlo
        const warn = t.mock.method(console, "warn", () => {});
        config.notificarUrl = "http://notificar.test/partidas";

        const res = await request(app).post("/api/partidas").send({ jugadores: ["viper", "nova"] });
        await esperarNotificacion();

        assert.equal(res.status, 201);
        assert.equal(warn.mock.callCount(), 1);
        assert.match(warn.mock.calls[0].arguments[0], /No se pudo notificar la partida 1/);
    });

    it("sin NOTIFICAR_URL no se llama al notificador", async (t) => {
        const fetchFalso = t.mock.method(globalThis, "fetch", proveedorFalso);
        config.notificarUrl = "";

        await request(app).post("/api/partidas").send({ jugadores: ["viper", "nova"] });
        await esperarNotificacion();

        assert.equal(fetchFalso.mock.callCount(), 2);
    });

    // validaciones: no deberian llamar al proveedor
    const malos = [
        [{ jugadores: ["viper"] }, /cantidad par/],
        [{ jugadores: ["viper", "nova", "ghost"] }, /cantidad par/],
        [{ jugadores: ["viper", "VIPER"] }, /repetidos/],
        [{ jugadores: "viper,nova" }, /lista de gamertags/],
        [{ jugadores: ["viper", ""] }, /lista de gamertags/],
        [{}, /lista de gamertags/]
    ];

    for (const [body, mensaje] of malos) {
        it(`400 con ${JSON.stringify(body)}`, async (t) => {
            const fetchFalso = t.mock.method(globalThis, "fetch", proveedorFalso);

            const res = await request(app).post("/api/partidas").send(body);

            assert.equal(res.status, 400);
            assert.match(res.body.message, mensaje);
            assert.equal(fetchFalso.mock.callCount(), 0);
        });
    }
});

describe("GET /api/jugadores/:gamertag/stats", () => {
    beforeEach(() => limpiarCache());

    it("200 con las stats calculadas", async (t) => {
        t.mock.method(globalThis, "fetch", proveedorFalso);

        const res = await request(app).get("/api/jugadores/viper/stats");

        assert.equal(res.status, 200);
        assert.equal(res.body.data.kd, 4);
    });

    it("504 si el proveedor tarda demasiado", async (t) => {
        t.mock.method(globalThis, "fetch", async () => {
            throw new DOMException("timeout", "TimeoutError");
        });

        const res = await request(app).get("/api/jugadores/viper/stats");
        assert.equal(res.status, 504);
    });
});

describe("balancear", () => {
    it("con 6 jugadores reparte A B B A A B", () => {
        const jugadores = [6, 5, 4, 3, 2, 1].map((kd) => ({ gamertag: `j${kd}`, kd }));
        const { equipoA, equipoB } = balancear(jugadores);

        assert.deepEqual(equipoA.map((j) => j.kd), [6, 3, 2]);
        assert.deepEqual(equipoB.map((j) => j.kd), [5, 4, 1]);
    });

    it("no cambia el orden de la lista original", () => {
        const jugadores = [{ kd: 1 }, { kd: 3 }];
        balancear(jugadores);
        assert.deepEqual(jugadores, [{ kd: 1 }, { kd: 3 }]);
    });
});
