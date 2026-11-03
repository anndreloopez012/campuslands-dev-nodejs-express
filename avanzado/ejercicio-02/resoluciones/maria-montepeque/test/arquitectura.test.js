import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Router } from "express";
import request from "supertest";
import { crearContenedor } from "../src/contenedor.js";
import { crearApp } from "../src/app.js";
import { MODULOS } from "../src/modules/index.js";

const carpetaModulos = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "src", "modules");

// todos los imports de un archivo
function importsDe(archivo) {
    const texto = readFileSync(archivo, "utf8");
    return [...texto.matchAll(/^import .* from "([^"]+)";?$/gm)].map((m) => m[1]);
}

describe("limites entre modulos", () => {
    const modulos = readdirSync(carpetaModulos, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);

    for (const modulo of modulos) {
        it(`${modulo} no importa archivos de otros modulos`, () => {
            const carpeta = path.join(carpetaModulos, modulo);
            const malos = [];

            for (const archivo of readdirSync(carpeta)) {
                for (const ruta of importsDe(path.join(carpeta, archivo))) {
                    // permitido: archivos del mismo modulo, shared, node: y paquetes
                    const permitido = ruta.startsWith("./") || ruta.startsWith("../../shared/") || !ruta.startsWith(".");
                    if (!permitido) malos.push(`${archivo} importa ${ruta}`);
                }
            }

            assert.deepEqual(malos, []);
        });
    }

    it("cada modulo declara nombre, ruta, necesita y crear", () => {
        for (const modulo of MODULOS) {
            assert.equal(typeof modulo.nombre, "string");
            assert.match(modulo.ruta, /^\/[a-z-]+$/);
            assert.ok(Array.isArray(modulo.necesita));
            assert.equal(typeof modulo.crear, "function");
        }
    });

    it("un modulo solo recibe los services que pidio", () => {
        const recibidos = {};
        const espia = (nombre, necesita) => ({
            nombre,
            ruta: `/${nombre}`,
            necesita,
            datosIniciales: [],
            crear({ servicios }) {
                recibidos[nombre] = Object.keys(servicios);
                return { service: {}, router: Router() };
            }
        });

        crearContenedor({ modulos: [espia("a", []), espia("b", ["a"]), espia("c", ["b"])] });

        assert.deepEqual(recibidos, { a: [], b: ["a"], c: ["b"] });
    });
});

describe("contenedor", () => {
    const modulo = (nombre, necesita) => ({
        nombre,
        ruta: `/${nombre}`,
        necesita,
        datosIniciales: [],
        crear: () => ({ service: {}, router: Router() })
    });

    it("crea los modulos en orden aunque esten registrados al reves", () => {
        const { modulos } = crearContenedor({ modulos: [modulo("c", ["b"]), modulo("b", ["a"]), modulo("a", [])] });
        assert.deepEqual(modulos.map((m) => m.nombre), ["a", "b", "c"]);
    });

    it("avisa si hay una dependencia circular", () => {
        assert.throws(
            () => crearContenedor({ modulos: [modulo("a", ["b"]), modulo("b", ["a"])] }),
            { message: "Dependencia circular entre modulos: a -> b -> a" }
        );
    });

    it("avisa si falta un modulo que se necesita", () => {
        assert.throws(() => crearContenedor({ modulos: [modulo("a", ["pagos"])] }), /necesita "pagos"/);
    });
});

describe("agregar un modulo nuevo sin tocar la app", () => {
    it("un modulo de anuncios que usa jugadores funciona solo con registrarlo", async () => {
        const anunciosModulo = {
            nombre: "anuncios",
            ruta: "/anuncios",
            necesita: ["jugadores"],
            datosIniciales: [],
            crear({ servicios }) {
                const router = Router();
                router.get("/", async (req, res) => {
                    const top = (await servicios.jugadores.listar()).sort((a, b) => b.elo - a.elo)[0];
                    res.json({ ok: true, data: `El mejor elo es de ${top.gamertag}` });
                });
                return { service: {}, router };
            }
        };

        const app = crearApp(crearContenedor({ modulos: [...MODULOS, anunciosModulo] }));
        const res = await request(app).get("/api/anuncios");

        assert.equal(res.status, 200);
        assert.equal(res.body.data, "El mejor elo es de Kai");
    });
});
