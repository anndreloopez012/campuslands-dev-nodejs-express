import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearPlanificador } from "../src/jobs/planificador.js";
import { crearApp } from "../src/app.js";

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const fecha = (texto) => new Date(texto);

describe("planificador", () => {
    it("tick corre solo los jobs que tocan en ese minuto", async () => {
        const p = crearPlanificador();
        const corridos = [];
        p.registrar({ nombre: "cada-hora", cron: "0 * * * *", tarea: () => corridos.push("cada-hora") });
        p.registrar({ nombre: "a-las-7", cron: "0 7 * * *", tarea: () => corridos.push("a-las-7") });

        await Promise.all(p.tick(fecha("2026-11-02T06:00:00Z")));
        await Promise.all(p.tick(fecha("2026-11-02T06:30:00Z")));
        await Promise.all(p.tick(fecha("2026-11-02T07:00:00Z")));
        assert.deepEqual(corridos, ["cada-hora", "cada-hora", "a-las-7"]);
    });

    it("dos ticks en el mismo minuto no corren el job dos veces", async () => {
        const p = crearPlanificador();
        let veces = 0;
        p.registrar({ nombre: "x", cron: "* * * * *", tarea: () => veces++ });
        await Promise.all(p.tick(fecha("2026-11-02T10:00:05Z")));
        await Promise.all(p.tick(fecha("2026-11-02T10:00:45Z")));
        assert.equal(veces, 1);
    });

    it("si sigue corriendo cuando le toca otra vez, se salta (no se encima)", async () => {
        const p = crearPlanificador();
        let corriendoAhora = 0;
        let maximo = 0;
        p.registrar({
            nombre: "lento",
            cron: "* * * * *",
            tarea: async () => {
                corriendoAhora++;
                maximo = Math.max(maximo, corriendoAhora);
                await esperar(40);
                corriendoAhora--;
            }
        });
        const primera = p.tick(fecha("2026-11-02T10:00:00Z"));
        const [segunda] = p.tick(fecha("2026-11-02T10:01:00Z"));

        assert.equal((await segunda).estado, "saltado");
        await Promise.all(primera);
        assert.equal(maximo, 1);
        assert.deepEqual(p.historial("lento").map((h) => h.estado), ["saltado", "ok"]);
    });

    it("reintenta y guarda el error si todos los intentos fallan", async () => {
        const p = crearPlanificador();
        let intentos = 0;
        p.registrar({ nombre: "inestable", cron: "* * * * *", reintentos: 2, tarea: () => { intentos++; if (intentos < 3) throw new Error("sin conexion"); return "listo"; } });
        p.registrar({ nombre: "roto", cron: "* * * * *", reintentos: 1, tarea: () => { throw new Error("siempre falla"); } });

        const [ok, mal] = await Promise.all(p.tick(fecha("2026-11-02T10:00:00Z")));
        assert.deepEqual([ok.estado, ok.intentos, ok.resultado], ["ok", 3, "listo"]);
        assert.deepEqual([mal.estado, mal.intentos, mal.error], ["error", 2, "siempre falla"]);
        assert.equal(p.listar().find((j) => j.nombre === "roto").corriendo, false);
    });

    it("un job que se cuelga termina por timeout y libera el lugar", async () => {
        const p = crearPlanificador();
        p.registrar({ nombre: "colgado", cron: "* * * * *", timeoutMs: 20, tarea: () => new Promise(() => {}) });
        const registro = await p.ejecutarAhora("colgado");
        assert.equal(registro.estado, "error");
        assert.match(registro.error, /timeout/);
        assert.equal((await p.ejecutarAhora("colgado")).estado, "error"); // no dice "saltado"
    });

    it("un job pausado no corre en el tick", async () => {
        const p = crearPlanificador();
        let veces = 0;
        p.registrar({ nombre: "x", cron: "* * * * *", tarea: () => veces++ });
        p.pausar("x");
        await Promise.all(p.tick(fecha("2026-11-02T10:00:00Z")));
        p.reanudar("x");
        await Promise.all(p.tick(fecha("2026-11-02T10:01:00Z")));
        assert.equal(veces, 1);
    });
});

describe("API del taller", () => {
    const reloj = () => fecha("2026-11-02T06:59:00Z"); // lunes

    it("lista los jobs con su proxima ejecucion", async () => {
        const res = await request(crearApp({ reloj })).get("/api/jobs");
        const cert = res.body.data.find((j) => j.nombre === "certificaciones");
        assert.equal(cert.siguiente, "2026-11-02T07:00:00.000Z");
        const limpiar = res.body.data.find((j) => j.nombre === "limpiar-inspecciones");
        assert.equal(limpiar.siguiente, "2026-11-08T03:00:00.000Z"); // domingo
    });

    it("el job de certificaciones genera alertas de las que vencen en menos de 30 dias", async () => {
        const app = crearApp({ reloj });
        await Promise.all(app.locals.planificador.tick(fecha("2026-11-02T07:00:00Z")));
        const alertas = (await request(app).get("/api/taller/alertas")).body.data;
        assert.deepEqual(alertas.filter((a) => a.tipo === "certificacion").map((a) => a.mensaje), [
            "Ramiro (MIG): su certificacion vence en 18 dias",
            "Julio (electrodo revestido): su certificacion vence en 3 dias"
        ]);
        // a las 07:00 de un lunes tambien toca el de mantenimiento (cada hora)
        assert.equal(alertas.filter((a) => a.tipo === "mantenimiento").length, 1);
    });

    it("el reporte suma el consumo del dia anterior", async () => {
        const app = crearApp({ reloj });
        app.locals.taller.registrarConsumo({ fecha: "2026-11-01T10:00:00Z", kgElectrodo: 2.5, m3Gas: 1.2 });
        app.locals.taller.registrarConsumo({ fecha: "2026-11-01T15:00:00Z", kgElectrodo: 1.25, m3Gas: 0.8 });
        app.locals.taller.registrarConsumo({ fecha: "2026-11-02T06:00:00Z", kgElectrodo: 9, m3Gas: 9 });

        const res = await request(app).post("/api/jobs/reporte-consumo/ejecutar");
        assert.equal(res.status, 200);
        assert.deepEqual(res.body.data.resultado, { dia: "2026-11-01", kgElectrodo: 3.75, m3Gas: 2 });
    });

    it("pausar quita la siguiente ejecucion; 404 con un job que no existe", async () => {
        const app = crearApp({ reloj });
        assert.equal((await request(app).post("/api/jobs/mantenimiento/pausar")).body.data.siguiente, null);
        assert.equal((await request(app).post("/api/jobs/no-existe/ejecutar")).status, 404);
    });

    it("/api/cron/siguientes ayuda a probar expresiones y da 400 si es invalida", async () => {
        const app = crearApp({ reloj });
        const res = await request(app).get("/api/cron/siguientes").query({ expr: "*/30 7 * * *", n: 3 });
        assert.deepEqual(res.body.data, ["2026-11-02T07:00:00.000Z", "2026-11-02T07:30:00.000Z", "2026-11-03T07:00:00.000Z"]);
        assert.equal((await request(app).get("/api/cron/siguientes").query({ expr: "99 * * * *" })).status, 400);
    });
});
