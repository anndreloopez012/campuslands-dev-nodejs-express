import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import { crearCola } from "../src/cola/cola.js";

// la cola sola, con trabajos de mentira y tiempos cortos

const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
let cola;

afterEach(async () => {
    await cola?.cerrar();
});

describe("cola de tareas", () => {
    it("encolar devuelve enseguida y el trabajo corre despues", async () => {
        cola = crearCola();
        let corrio = false;
        cola.registrar("tarea", async () => {
            corrio = true;
            return "listo";
        });

        const tarea = cola.encolar("tarea", {});
        assert.equal(tarea.estado, "pendiente");
        assert.equal(corrio, false);

        const final = await cola.cuandoTermine(tarea.id);
        assert.equal(final.estado, "completada");
        assert.equal(final.resultado, "listo");
        assert.equal(final.intentos, 1);
    });

    it("no trabaja mas tareas a la vez que la concurrencia", async () => {
        cola = crearCola({ concurrencia: 2 });
        let ahora = 0;
        let maximo = 0;
        cola.registrar("lenta", async () => {
            ahora++;
            maximo = Math.max(maximo, ahora);
            await pausa(15);
            ahora--;
        });

        const ids = Array.from({ length: 6 }, () => cola.encolar("lenta", {}).id);
        await Promise.all(ids.map(cola.cuandoTermine));

        assert.equal(maximo, 2);
    });

    it("las de prioridad alta salen primero", async () => {
        cola = crearCola({ concurrencia: 1 });
        const orden = [];
        cola.registrar("t", async ({ nombre }) => orden.push(nombre));

        cola.pausar();
        cola.encolar("t", { nombre: "baja-1" }, { prioridad: "baja" });
        cola.encolar("t", { nombre: "normal-1" });
        cola.encolar("t", { nombre: "alta-1" }, { prioridad: "alta" });
        const ultima = cola.encolar("t", { nombre: "alta-2" }, { prioridad: "alta" });
        cola.encolar("t", { nombre: "normal-2" });
        cola.reanudar();

        await pausa(30);
        await cola.cuandoTermine(ultima.id);
        assert.deepEqual(orden.slice(0, 2), ["alta-1", "alta-2"]);
        await pausa(10);
        assert.deepEqual(orden, ["alta-1", "alta-2", "normal-1", "normal-2", "baja-1"]);
    });

    it("reintenta con backoff exponencial hasta que sale", async () => {
        cola = crearCola({ backoffBaseMs: 20, maxIntentos: 3 });
        const momentos = [];
        cola.registrar("inestable", async (datos, { intento }) => {
            momentos.push(Date.now());
            if (intento < 3) throw new Error(`fallo ${intento}`);
            return "salio";
        });

        const tarea = cola.encolar("inestable", {});
        await pausa(5);
        assert.equal(cola.obtener(tarea.id).estado, "esperando_reintento");
        assert.equal(cola.obtener(tarea.id).proximoIntentoEnMs, 20);

        const final = await cola.cuandoTermine(tarea.id);
        assert.equal(final.estado, "completada");
        assert.equal(final.intentos, 3);
        assert.deepEqual(final.errores.map((e) => e.mensaje), ["fallo 1", "fallo 2"]);

        // la segunda espera es el doble que la primera (20ms y 40ms)
        assert.ok(momentos[1] - momentos[0] >= 18);
        assert.ok(momentos[2] - momentos[1] >= 38);
    });

    it("si falla todos los intentos queda fallida en la lista de muertas", async () => {
        cola = crearCola({ backoffBaseMs: 1, maxIntentos: 2 });
        cola.registrar("rota", async () => {
            throw new Error("siempre falla");
        });

        const tarea = cola.encolar("rota", {});
        const final = await cola.cuandoTermine(tarea.id);

        assert.equal(final.estado, "fallida");
        assert.equal(final.intentos, 2);
        assert.deepEqual(cola.muertas(), [tarea.id]);
    });

    it("una tarea muerta se puede reintentar a mano", async () => {
        cola = crearCola({ backoffBaseMs: 1, maxIntentos: 1 });
        let arreglado = false;
        cola.registrar("depende", async () => {
            if (!arreglado) throw new Error("todavia roto");
            return "ahora si";
        });

        const tarea = cola.encolar("depende", {});
        await cola.cuandoTermine(tarea.id);

        arreglado = true;
        cola.reintentar(tarea.id);
        const final = await cola.cuandoTermine(tarea.id);

        assert.equal(final.estado, "completada");
        assert.deepEqual(cola.muertas(), []);
        assert.throws(() => cola.reintentar(tarea.id), /Solo se reintentan tareas fallidas/);
    });

    it("una tarea que tarda demasiado se corta por timeout", async () => {
        cola = crearCola({ timeoutMs: 20, maxIntentos: 1 });
        cola.registrar("colgada", () => pausa(200));

        const final = await cola.cuandoTermine(cola.encolar("colgada", {}).id);

        assert.equal(final.estado, "fallida");
        assert.match(final.errores[0].mensaje, /tiempo limite de 20ms/);
    });

    it("pausada no toma tareas, al reanudar si", async () => {
        cola = crearCola();
        cola.registrar("t", async () => "ok");
        cola.pausar();

        const tarea = cola.encolar("t", {});
        await pausa(10);
        assert.equal(cola.obtener(tarea.id).estado, "pendiente");
        assert.equal(cola.estadisticas().pausada, true);

        cola.reanudar();
        assert.equal((await cola.cuandoTermine(tarea.id)).estado, "completada");
    });

    it("un trabajo puede encolar otro (queda el padreId)", async () => {
        cola = crearCola();
        cola.registrar("hija", async ({ n }) => n * 2);
        cola.registrar("madre", async (datos, { encolar }) => encolar("hija", { n: 21 }).id);

        const madre = await cola.cuandoTermine(cola.encolar("madre", {}).id);
        const hija = await cola.cuandoTermine(madre.resultado);

        assert.equal(hija.resultado, 42);
        assert.equal(hija.padreId, madre.id);
    });

    it("cerrar espera las que estan en proceso", async () => {
        cola = crearCola();
        let termino = false;
        cola.registrar("t", async () => {
            await pausa(20);
            termino = true;
        });

        cola.encolar("t", {});
        await pausa(2);
        await cola.cerrar();
        assert.equal(termino, true);
    });

    it("errores claros al encolar algo mal", () => {
        cola = crearCola();
        cola.registrar("t", async () => {});
        assert.throws(() => cola.encolar("no-existe", {}), /No hay un trabajo registrado/);
        assert.throws(() => cola.encolar("t", {}, { prioridad: "toString" }), /prioridad debe ser/);
    });

    it("la tarea que se devuelve es una copia", async () => {
        cola = crearCola();
        cola.registrar("t", async () => {});
        const tarea = cola.encolar("t", { a: 1 });
        tarea.estado = "hackeada";
        assert.notEqual(cola.obtener(tarea.id).estado, "hackeada");
    });
});
