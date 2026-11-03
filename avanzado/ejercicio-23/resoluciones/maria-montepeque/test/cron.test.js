import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { coincide, ErrorCron, parsearCron, siguientes } from "../src/jobs/cron.js";

const lista = (set) => [...set];

describe("parsearCron", () => {
    it("entiende *, numeros, listas, rangos y pasos", () => {
        const c = parsearCron("*/15 9-11 1,15 * 1-5/2");
        assert.deepEqual(lista(c.minuto), [0, 15, 30, 45]);
        assert.deepEqual(lista(c.hora), [9, 10, 11]);
        assert.deepEqual(lista(c.dia), [1, 15]);
        assert.equal(c.mes.size, 12);
        assert.deepEqual(lista(c.diaSemana), [1, 3, 5]);
    });

    it("'5/20' es desde 5 cada 20", () => {
        assert.deepEqual(lista(parsearCron("5/20 * * * *").minuto), [5, 25, 45]);
    });

    it("rechaza expresiones malas", () => {
        for (const mala of ["* * * *", "60 * * * *", "* 24 * * *", "* * 0 * *", "*/0 * * * *", "a * * * *", "10-5 * * * *"]) {
            assert.throws(() => parsearCron(mala), ErrorCron, mala);
        }
    });
});

describe("coincide y siguientes", () => {
    it("07:00 de lunes a viernes", () => {
        const c = parsearCron("0 7 * * 1-5");
        assert.equal(coincide(c, new Date("2026-11-02T07:00:00Z")), true); // lunes
        assert.equal(coincide(c, new Date("2026-11-02T07:01:00Z")), false);
        assert.equal(coincide(c, new Date("2026-11-01T07:00:00Z")), false); // domingo
    });

    it("da las proximas ejecuciones saltando el fin de semana", () => {
        const c = parsearCron("0 7 * * 1-5");
        const proximas = siguientes(c, new Date("2026-11-06T08:00:00Z"), 2).map((f) => f.toISOString()); // viernes 08:00
        assert.deepEqual(proximas, ["2026-11-09T07:00:00.000Z", "2026-11-10T07:00:00.000Z"]);
    });

    it("no cuenta el minuto actual, empieza en el siguiente", () => {
        const c = parsearCron("* * * * *");
        assert.equal(siguientes(c, new Date("2026-11-02T10:00:30Z"))[0].toISOString(), "2026-11-02T10:01:00.000Z");
    });
});
