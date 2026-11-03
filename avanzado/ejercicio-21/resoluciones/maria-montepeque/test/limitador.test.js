import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ColaLlena, crearLimitador } from "../src/concurrencia/limitador.js";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

describe("limitador", () => {
    it("nunca corre mas de `max` tareas a la vez", async () => {
        const limitador = crearLimitador({ max: 3, maxCola: 20 });
        let corriendo = 0;
        let maximoVisto = 0;
        const tarea = async () => {
            corriendo++;
            maximoVisto = Math.max(maximoVisto, corriendo);
            await esperar(5);
            corriendo--;
        };

        await Promise.all(Array.from({ length: 12 }, () => limitador.ejecutar(tarea)));
        assert.equal(maximoVisto, 3);
        assert.equal(limitador.estado().pico, 3);
        assert.equal(limitador.estado().completadas, 12);
    });

    it("las que esperan salen en orden de llegada (FIFO)", async () => {
        const limitador = crearLimitador({ max: 1, maxCola: 10 });
        const orden = [];
        await Promise.all([1, 2, 3, 4].map((n) => limitador.ejecutar(async () => {
            await esperar(1);
            orden.push(n);
        })));
        assert.deepEqual(orden, [1, 2, 3, 4]);
    });

    it("devuelve el resultado de cada tarea", async () => {
        const limitador = crearLimitador({ max: 2 });
        const resultados = await Promise.all([1, 2, 3].map((n) => limitador.ejecutar(async () => n * 10)));
        assert.deepEqual(resultados, [10, 20, 30]);
    });

    it("si la cola esta llena rechaza con ColaLlena", async () => {
        const limitador = crearLimitador({ max: 1, maxCola: 2 });
        const lenta = () => esperar(20);
        const aceptadas = [limitador.ejecutar(lenta), limitador.ejecutar(lenta), limitador.ejecutar(lenta)];
        await assert.rejects(limitador.ejecutar(lenta), ColaLlena);
        assert.deepEqual({ activos: limitador.estado().activos, enCola: limitador.estado().enCola }, { activos: 1, enCola: 2 });
        await Promise.all(aceptadas);
    });

    it("una tarea que falla libera su lugar y no traba la cola", async () => {
        const limitador = crearLimitador({ max: 1, maxCola: 5 });
        const fallo = limitador.ejecutar(async () => {
            throw new Error("se cayo el render");
        });
        const despues = limitador.ejecutar(async () => "sigue funcionando");

        await assert.rejects(fallo, /se cayo/);
        assert.equal(await despues, "sigue funcionando");
        assert.deepEqual([limitador.estado().fallidas, limitador.estado().activos], [1, 0]);
    });
});
