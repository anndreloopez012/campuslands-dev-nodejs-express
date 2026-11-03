import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import request from "supertest";
import { crearContenedor } from "../src/contenedor.js";
import { crearApp } from "../src/app.js";

// para escalar se levantan varias copias de la app detras de un balanceador
// eso solo funciona si la app no guarda estado propio y todas usan el mismo almacenamiento
// aqui simulo dos instancias que comparten la carpeta de datos

let dataDir;

beforeEach(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "avanzado02-"));
});

afterEach(async () => {
    await rm(dataDir, { recursive: true, force: true });
});

const nuevaInstancia = () => crearApp(crearContenedor({ repo: "archivo", dataDir }));

describe("dos instancias con el mismo almacenamiento", () => {
    it("lo que crea la instancia A lo ve la instancia B", async () => {
        const a = nuevaInstancia();
        const b = nuevaInstancia();

        const creado = await request(a).post("/api/jugadores").send({ gamertag: "Shared", region: "LATAM", elo: 1900 });
        assert.equal(creado.status, 201);

        const visto = await request(b).get(`/api/jugadores/${creado.body.data.id}`);
        assert.equal(visto.status, 200);
        assert.equal(visto.body.data.gamertag, "Shared");
    });

    it("una inscripcion hecha en B se ve en A", async () => {
        const a = nuevaInstancia();
        const b = nuevaInstancia();

        await request(b).post("/api/torneos/1/inscripciones").send({ equipoId: 1 });

        const torneo = await request(a).get("/api/torneos/1");
        assert.equal(torneo.body.data.cuposLibres, 7);
    });

    it("una instancia nueva (como despues de reiniciar) sigue teniendo los datos", async () => {
        await request(nuevaInstancia()).post("/api/jugadores").send({ gamertag: "Persiste", region: "EU" });

        const reiniciada = nuevaInstancia();
        const lista = await request(reiniciada).get("/api/jugadores?region=EU");
        assert.ok(lista.body.data.some((j) => j.gamertag === "Persiste"));
    });

    it("muchas creaciones al mismo tiempo en una instancia no pierden datos", async () => {
        const app = nuevaInstancia();

        // 15 peticiones a la vez
        const respuestas = await Promise.all(
            Array.from({ length: 15 }, (_, i) => request(app).post("/api/jugadores").send({ gamertag: `Bot${i}`, region: "NA" }))
        );

        assert.ok(respuestas.every((r) => r.status === 201));
        const ids = respuestas.map((r) => r.body.data.id);
        assert.equal(new Set(ids).size, 15);

        const enArchivo = JSON.parse(await readFile(path.join(dataDir, "jugadores.json"), "utf8"));
        assert.equal(enArchivo.length, 8 + 15);
    });

    it("cada modulo guarda en su propio archivo", async () => {
        const app = nuevaInstancia();
        await request(app).post("/api/jugadores").send({ gamertag: "Uno", region: "NA" });
        await request(app).post("/api/torneos").send({ nombre: "Copa Archivo", cupo: 4 });

        const jugadores = JSON.parse(await readFile(path.join(dataDir, "jugadores.json"), "utf8"));
        const torneos = JSON.parse(await readFile(path.join(dataDir, "torneos.json"), "utf8"));

        assert.ok(jugadores.some((j) => j.gamertag === "Uno"));
        assert.ok(torneos.some((t) => t.nombre === "Copa Archivo"));
    });
});

describe("memoria vs archivo dan las mismas respuestas", () => {
    for (const repo of ["memoria", "archivo"]) {
        it(`con repo ${repo}`, async () => {
            const app = crearApp(crearContenedor({ repo, dataDir }));

            const equipo = await request(app).get("/api/equipos/1");
            const nuevo = await request(app).post("/api/jugadores").send({ gamertag: "Igual", region: "ASIA" });

            assert.equal(equipo.body.data.eloPromedio, 1990);
            assert.deepEqual(nuevo.body.data, { id: 9, gamertag: "Igual", region: "ASIA", elo: 1000 });
        });
    }
});
