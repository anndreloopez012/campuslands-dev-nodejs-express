// ayuda para los tests de integracion:
// cada test tiene su propia carpeta temporal con su propio archivo de datos
// asi los tests no se pisan entre ellos y no tocan data/ de verdad
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { crearApp } from "../../src/app.js";

export async function prepararPartida({ aleatorio = () => 0 } = {}) {
    const carpeta = await mkdtemp(path.join(tmpdir(), "rpg-test-"));
    const app = crearApp({ carpetaDatos: carpeta, aleatorio });
    return {
        app,
        carpeta,
        archivo: path.join(carpeta, "partida.json"),
        // "reiniciar el servidor": app nueva leyendo la misma carpeta
        reiniciar: () => crearApp({ carpetaDatos: carpeta, aleatorio }),
        crear: (body) => request(app).post("/api/personajes").send(body),
        limpiar: () => rm(carpeta, { recursive: true, force: true })
    };
}
