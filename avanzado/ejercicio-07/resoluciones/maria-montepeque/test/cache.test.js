import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearCache } from "../src/cache/cache.js";

// la cache sola; el tiempo se controla con t.mock.timers

describe("crearCache", () => {
    it("la primera vez es MISS y busca; la segunda es HIT y no busca", async () => {
        const cache = crearCache();
        let buscadas = 0;
        const buscar = async () => ++buscadas;

        assert.deepEqual(await cache.obtener("a", buscar), { valor: 1, estado: "MISS", edadSeg: 0 });
        assert.deepEqual(await cache.obtener("a", buscar), { valor: 1, estado: "HIT", edadSeg: 0 });
        assert.equal(buscadas, 1);
    });

    it("el dato vence despues del TTL y Age dice cuantos segundos tiene", async (t) => {
        t.mock.timers.enable({ apis: ["Date"], now: 0 });
        const cache = crearCache({ ttlMs: 10_000 });
        let buscadas = 0;
        const buscar = async () => ++buscadas;

        await cache.obtener("a", buscar);
        t.mock.timers.tick(9_000);
        assert.deepEqual(await cache.obtener("a", buscar), { valor: 1, estado: "HIT", edadSeg: 9 });

        t.mock.timers.tick(1_000);
        assert.equal((await cache.obtener("a", buscar)).estado, "MISS");
        assert.equal(buscadas, 2);
        assert.equal(cache.estadisticas().expiradas, 1);
    });

    it("cada dato puede tener su propio TTL", async (t) => {
        t.mock.timers.enable({ apis: ["Date"], now: 0 });
        const cache = crearCache({ ttlMs: 10_000 });

        await cache.obtener("corto", async () => 1, { ttl: 1_000 });
        t.mock.timers.tick(1_000);
        assert.equal((await cache.obtener("corto", async () => 2)).estado, "MISS");
    });

    it("LRU: al pasarse del maximo saca la que hace mas que nadie usa", async () => {
        const cache = crearCache({ maxEntradas: 2 });
        await cache.obtener("a", async () => "A");
        await cache.obtener("b", async () => "B");
        await cache.obtener("a", async () => "A"); // a queda como la mas reciente
        await cache.obtener("c", async () => "C"); // se va b

        assert.deepEqual(cache.claves(), ["a", "c"]);
        assert.equal(cache.estadisticas().desalojadas, 1);
    });

    it("muchos pidiendo lo mismo a la vez: se busca una sola vez", async () => {
        const cache = crearCache();
        let buscadas = 0;
        const lenta = async () => {
            buscadas++;
            await new Promise((r) => setTimeout(r, 20));
            return "dato";
        };

        const resultados = await Promise.all(Array.from({ length: 10 }, () => cache.obtener("x", lenta)));

        assert.equal(buscadas, 1);
        assert.ok(resultados.every((r) => r.valor === "dato"));
    });

    it("si buscar falla no se guarda nada y el siguiente vuelve a intentar", async () => {
        const cache = crearCache();
        await assert.rejects(cache.obtener("x", async () => { throw new Error("caido"); }), /caido/);
        assert.deepEqual(cache.claves(), []);
        assert.equal((await cache.obtener("x", async () => "ok")).valor, "ok");
    });

    it("invalidar por etiqueta borra solo lo que la tiene", async () => {
        const cache = crearCache();
        await cache.obtener("auto:1", async () => 1, { etiquetas: ["auto:1"] });
        await cache.obtener("lista", async () => [1, 2], { etiquetas: ["listas"] });
        await cache.obtener("auto:2", async () => 2, { etiquetas: ["auto:2"] });

        assert.equal(cache.invalidarEtiqueta("auto:1"), 1);
        assert.deepEqual(cache.claves(), ["lista", "auto:2"]);
    });

    it("estadisticas con la tasa de acierto", async () => {
        const cache = crearCache();
        await cache.obtener("a", async () => 1);
        await cache.obtener("a", async () => 1);
        await cache.obtener("a", async () => 1);
        await cache.obtener("b", async () => 1);

        const s = cache.estadisticas();
        assert.equal(s.hits, 2);
        assert.equal(s.misses, 2);
        assert.equal(s.tasaAcierto, 50);
    });
});
