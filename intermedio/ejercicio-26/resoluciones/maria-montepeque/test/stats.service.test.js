import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { obtenerStats, calcularRango, limpiarCache } from "../src/services/stats.service.js";

const STATS_OK = { kills: 300, muertes: 100, victorias: 30, partidas: 50 };

describe("stats.service", () => {
    beforeEach(() => {
        limpiarCache();
    });

    it("calcula kd, winrate y rango", async (t) => {
        t.mock.method(globalThis, "fetch", async () => Response.json(STATS_OK));

        const stats = await obtenerStats("Viper");

        assert.equal(stats.kd, 3);
        assert.equal(stats.winrate, 60);
        assert.equal(stats.rango, "Diamante");
        assert.equal(stats.desdeCache, false);
    });

    it("si nunca murio no da infinito", async (t) => {
        t.mock.method(globalThis, "fetch", async () => Response.json({ kills: 7, muertes: 0, victorias: 0, partidas: 0 }));

        const stats = await obtenerStats("nuevo");

        assert.equal(stats.kd, 7);
        assert.equal(stats.winrate, 0);
    });

    it("usa la cache hasta que pasan 60 segundos", async (t) => {
        const fetchFalso = t.mock.method(globalThis, "fetch", async () => Response.json(STATS_OK));
        // reloj falso: Date.now() empieza en 0 y solo avanza con tick
        t.mock.timers.enable({ apis: ["Date"], now: 0 });

        await obtenerStats("Viper");

        t.mock.timers.tick(59_000);
        const segunda = await obtenerStats("VIPER");
        assert.equal(segunda.desdeCache, true);
        assert.equal(fetchFalso.mock.callCount(), 1);

        t.mock.timers.tick(1_000);
        const tercera = await obtenerStats("Viper");
        assert.equal(tercera.desdeCache, false);
        assert.equal(fetchFalso.mock.callCount(), 2);
    });

    it("no guarda en cache si el proveedor falla", async (t) => {
        const fetchFalso = t.mock.method(globalThis, "fetch", async () => new Response("", { status: 503 }));

        await assert.rejects(obtenerStats("Viper"), { statusCode: 502 });

        // ahora el proveedor ya responde bien
        fetchFalso.mock.mockImplementation(async () => Response.json(STATS_OK));
        const stats = await obtenerStats("Viper");
        assert.equal(stats.desdeCache, false);
    });

    describe("calcularRango", () => {
        const casos = [
            [2.5, 70, "Diamante"],
            [2.5, 40, "Oro"],
            [1.6, 55, "Platino"],
            [1.2, 80, "Oro"],
            [0.8, 50, "Plata"],
            [0.5, 90, "Bronce"]
        ];

        for (const [kd, winrate, rango] of casos) {
            it(`kd ${kd} y winrate ${winrate} => ${rango}`, () => {
                assert.equal(calcularRango(kd, winrate), rango);
            });
        }
    });
});
