// tests de INTEGRACION: HTTP -> rutas -> servicio -> repositorio -> archivo JSON real
import { afterEach, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir, writeFile } from "node:fs/promises";
import request from "supertest";
import { prepararPartida } from "./preparar.js";

let partida;

beforeEach(async () => {
    partida = await prepararPartida();
});

afterEach(async () => {
    await partida.limpiar();
});

describe("flujo completo de un personaje", () => {
    it("crear -> equipar -> pelear -> subir de nivel, y todo queda en el archivo", async () => {
        const { app } = partida;
        const creado = await partida.crear({ nombre: "Aragorn", clase: "guerrero" });
        assert.equal(creado.status, 201);
        const id = creado.body.data.id;

        const equipado = await request(app).post(`/api/personajes/${id}/equipo`).send({ objeto: "espada-larga" });
        assert.deepEqual(equipado.body.data.stats, { ataque: 20, defensa: 8 });

        // con el dado en 0: 20 - 1 = 19 por golpe, el slime (30) cae en 2 turnos
        const contraSlime = await request(app).post(`/api/personajes/${id}/batallas`).send({ monstruo: "slime" });
        assert.deepEqual([contraSlime.body.data.gano, contraSlime.body.data.turnos, contraSlime.body.data.subioNivel], [true, 2, false]);

        // lobo da 90 xp: 40 + 90 = 130 -> nivel 2 y sobran 30
        const contraLobo = await request(app).post(`/api/personajes/${id}/batallas`).send({ monstruo: "lobo" });
        assert.equal(contraLobo.body.data.subioNivel, true);
        assert.deepEqual([contraLobo.body.data.personaje.nivel, contraLobo.body.data.personaje.experiencia], [2, 30]);

        // lo que dice la API es lo que quedo guardado en disco
        const enDisco = JSON.parse(await readFile(partida.archivo, "utf8"));
        assert.deepEqual(
            { nivel: enDisco.personajes[0].nivel, victorias: enDisco.personajes[0].victorias, equipo: enDisco.personajes[0].equipo },
            { nivel: 2, victorias: 2, equipo: ["espada-larga"] }
        );
    });

    it("perder una batalla suma una derrota y no da xp", async () => {
        const { body } = await partida.crear({ nombre: "Merlin", clase: "mago" });
        const res = await request(partida.app).post(`/api/personajes/${body.data.id}/batallas`).send({ monstruo: "golem" });
        assert.equal(res.body.data.gano, false);
        assert.deepEqual([res.body.data.personaje.derrotas, res.body.data.personaje.experiencia], [1, 0]);
    });
});

describe("persistencia", () => {
    it("los datos sobreviven a un reinicio del servidor", async () => {
        await partida.crear({ nombre: "Legolas", clase: "arquero" });
        const appNueva = partida.reiniciar();
        const res = await request(appNueva).get("/api/personajes/1");
        assert.equal(res.status, 200);
        assert.equal(res.body.data.nombre, "Legolas");
    });

    it("sin archivo arranca con la partida vacia", async () => {
        const res = await request(partida.app).get("/api/personajes");
        assert.deepEqual(res.body.data, []);
    });

    it("muchas creaciones a la vez: no se pierde ninguna y los ids no se repiten", async () => {
        const nombres = Array.from({ length: 15 }, (_, i) => `Heroe ${i + 1}`);
        const respuestas = await Promise.all(nombres.map((nombre) => partida.crear({ nombre, clase: "guerrero" })));
        assert.ok(respuestas.every((r) => r.status === 201));

        const enDisco = JSON.parse(await readFile(partida.archivo, "utf8"));
        assert.equal(enDisco.personajes.length, 15);
        assert.equal(new Set(enDisco.personajes.map((p) => p.id)).size, 15);
        // la escritura atomica no deja archivos .tmp tirados
        assert.deepEqual(await readdir(partida.carpeta), ["partida.json"]);
    });

    it("dos con el mismo nombre al mismo tiempo: uno 201 y el otro 409", async () => {
        const [a, b] = await Promise.all([partida.crear({ nombre: "Gimli", clase: "guerrero" }), partida.crear({ nombre: "gimli", clase: "guerrero" })]);
        assert.deepEqual([a.status, b.status].sort(), [201, 409]);
    });

    it("si el archivo esta danado responde 500 con un mensaje claro (y despues sigue funcionando la fila)", async () => {
        await writeFile(partida.archivo, "{ esto no es json");
        const res = await request(partida.app).get("/api/personajes");
        assert.equal(res.status, 500);
        assert.equal(res.body.message, "No se pudo leer la partida guardada");

        await writeFile(partida.archivo, JSON.stringify({ siguienteId: 1, personajes: [] }));
        assert.equal((await partida.crear({ nombre: "Frodo", clase: "arquero" })).status, 201);
    });
});

describe("errores a traves de todas las capas", () => {
    it("400 con datos malos y no se escribe nada en disco", async () => {
        const res = await partida.crear({ nombre: "X", clase: "paladin" });
        assert.equal(res.status, 400);
        assert.equal(res.body.errors.length, 2);
        assert.deepEqual(await readdir(partida.carpeta), []);
    });

    it("422 si la clase no puede usar el objeto o ya tiene 2", async () => {
        const { body } = await partida.crear({ nombre: "Boromir", clase: "guerrero" });
        const url = `/api/personajes/${body.data.id}/equipo`;
        assert.equal((await request(partida.app).post(url).send({ objeto: "baculo-arcano" })).status, 422);
        await request(partida.app).post(url).send({ objeto: "espada-larga" });
        assert.equal((await request(partida.app).post(url).send({ objeto: "espada-larga" })).status, 409);
        await request(partida.app).post(url).send({ objeto: "escudo-roble" });
        // tiene 2: no caben mas (aunque fuera otro objeto valido)
        const lleno = await request(partida.app).get(`/api/personajes/${body.data.id}`);
        assert.equal(lleno.body.data.equipo.length, 2);
    });

    it("404 de personaje y 400 de monstruo que no existe", async () => {
        assert.equal((await request(partida.app).post("/api/personajes/99/batallas").send({ monstruo: "slime" })).status, 404);
        await partida.crear({ nombre: "Sam", clase: "arquero" });
        assert.equal((await request(partida.app).post("/api/personajes/1/batallas").send({ monstruo: "dragon" })).status, 400);
    });
});
