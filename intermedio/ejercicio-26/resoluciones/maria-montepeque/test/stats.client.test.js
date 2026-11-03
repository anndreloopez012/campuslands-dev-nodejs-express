import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { pedirStats } from "../src/clients/stats.client.js";

// el client usa el fetch global, aqui lo reemplazo con t.mock.method
// t.mock lo devuelve a la normalidad solo al terminar cada test

const STATS_OK = { kills: 300, muertes: 100, victorias: 30, partidas: 50 };

describe("stats.client", () => {
    it("pide las stats a la url del proveedor y las devuelve", async (t) => {
        const fetchFalso = t.mock.method(globalThis, "fetch", async () => Response.json(STATS_OK));

        const stats = await pedirStats("Viper");

        assert.deepEqual(stats, { gamertag: "Viper", ...STATS_OK });
        assert.equal(fetchFalso.mock.callCount(), 1);
        assert.equal(fetchFalso.mock.calls[0].arguments[0], "http://localhost:4026/stats/Viper");
    });

    it("codifica el gamertag en la url", async (t) => {
        const fetchFalso = t.mock.method(globalThis, "fetch", async () => Response.json(STATS_OK));

        await pedirStats("dark/../admin");

        assert.equal(fetchFalso.mock.calls[0].arguments[0], "http://localhost:4026/stats/dark%2F..%2Fadmin");
    });

    it("manda un signal para poder cortar por timeout", async (t) => {
        const fetchFalso = t.mock.method(globalThis, "fetch", async () => Response.json(STATS_OK));

        await pedirStats("Viper");

        assert.ok(fetchFalso.mock.calls[0].arguments[1].signal instanceof AbortSignal);
    });

    it("404 del proveedor => 404 jugador no existe", async (t) => {
        t.mock.method(globalThis, "fetch", async () => Response.json({}, { status: 404 }));

        await assert.rejects(pedirStats("nadie"), { statusCode: 404, message: "No existe el jugador nadie" });
    });

    it("500 del proveedor => 502", async (t) => {
        t.mock.method(globalThis, "fetch", async () => new Response("error", { status: 500 }));

        await assert.rejects(pedirStats("Viper"), { statusCode: 502, message: /respondio 500/ });
    });

    it("sin conexion => 502", async (t) => {
        t.mock.method(globalThis, "fetch", async () => {
            throw new TypeError("fetch failed");
        });

        await assert.rejects(pedirStats("Viper"), { statusCode: 502, message: /No se pudo conectar/ });
    });

    it("timeout => 504", async (t) => {
        // asi es el error que tira fetch cuando vence AbortSignal.timeout
        t.mock.method(globalThis, "fetch", async () => {
            throw new DOMException("The operation was aborted due to timeout", "TimeoutError");
        });

        await assert.rejects(pedirStats("Viper"), { statusCode: 504 });
    });

    // datos que podria mandar un proveedor roto
    const raros = [
        { kills: 10 },
        { ...STATS_OK, kills: -5 },
        { ...STATS_OK, muertes: "100" },
        { ...STATS_OK, victorias: 60 }
    ];

    for (const datos of raros) {
        it(`datos raros ${JSON.stringify(datos)} => 502`, async (t) => {
            t.mock.method(globalThis, "fetch", async () => Response.json(datos));
            await assert.rejects(pedirStats("Viper"), { statusCode: 502, message: /datos raros/ });
        });
    }
});
