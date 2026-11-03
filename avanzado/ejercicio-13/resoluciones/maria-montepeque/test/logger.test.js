import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearLogger, redactar, OCULTO } from "../src/logs/logger.js";
import { correrConContexto, log } from "../src/logs/contexto.js";

// logger que guarda las lineas en un arreglo
function loggerDePrueba(nivel = "debug") {
    const lineas = [];
    const logger = crearLogger({ nivel, destino: (l) => lineas.push(JSON.parse(l)) });
    return { logger, lineas };
}

describe("crearLogger", () => {
    it("escribe una linea JSON con time, level, msg y los datos", () => {
        const { logger, lineas } = loggerDePrueba();
        logger.info("mision creada", { misionId: 3 });

        assert.equal(lineas.length, 1);
        assert.equal(lineas[0].level, "info");
        assert.equal(lineas[0].msg, "mision creada");
        assert.equal(lineas[0].misionId, 3);
        assert.ok(!Number.isNaN(Date.parse(lineas[0].time)));
    });

    it("no escribe lo que esta por debajo del nivel minimo", () => {
        const { logger, lineas } = loggerDePrueba("warn");
        logger.debug("a");
        logger.info("b");
        logger.warn("c");
        logger.error("d");
        assert.deepEqual(lineas.map((l) => l.msg), ["c", "d"]);
    });

    it("un hijo agrega contexto fijo y no cambia al padre", () => {
        const { logger, lineas } = loggerDePrueba();
        const hijo = logger.hijo({ requestId: "abc" }).hijo({ modulo: "naves" });

        hijo.info("hola");
        logger.info("padre");

        assert.equal(lineas[0].requestId, "abc");
        assert.equal(lineas[0].modulo, "naves");
        assert.equal(lineas[1].requestId, undefined);
    });

    it("nivel invalido da error", () => {
        assert.throws(() => crearLogger({ nivel: "todo" }), /nivel de log invalido/);
    });
});

describe("redactar", () => {
    it("tapa lo sensible aunque este anidado o en arreglos, sin importar mayusculas", () => {
        const datos = { usuario: "ana", Password: "1234", perfil: { token: "xyz", nombre: "Ana" }, lista: [{ codigoAcceso: "999" }], headers: { Authorization: "Bearer x" } };

        assert.deepEqual(redactar(datos), {
            usuario: "ana",
            Password: OCULTO,
            perfil: { token: OCULTO, nombre: "Ana" },
            lista: [{ codigoAcceso: OCULTO }],
            headers: { Authorization: OCULTO }
        });
        // no cambia el original
        assert.equal(datos.Password, "1234");
    });

    it("convierte los Error en algo que se puede guardar en JSON (con stack)", () => {
        const r = redactar({ error: new TypeError("algo") }).error;
        assert.equal(r.tipo, "TypeError");
        assert.equal(r.mensaje, "algo");
        assert.match(r.stack, /TypeError: algo/);
    });
});

describe("contexto (AsyncLocalStorage)", () => {
    it("log() devuelve el logger de la peticion actual aunque haya awaits de por medio", async () => {
        const { logger, lineas } = loggerDePrueba();

        async function servicioProfundo() {
            await new Promise((r) => setTimeout(r, 5));
            log(logger).info("desde el service");
        }

        await Promise.all([
            correrConContexto({ logger: logger.hijo({ requestId: "uno" }) }, servicioProfundo),
            correrConContexto({ logger: logger.hijo({ requestId: "dos" }) }, servicioProfundo)
        ]);
        log(logger).info("fuera de una peticion");

        assert.deepEqual(lineas.map((l) => l.requestId).sort(), ["dos", "uno", undefined].sort());
    });
});
