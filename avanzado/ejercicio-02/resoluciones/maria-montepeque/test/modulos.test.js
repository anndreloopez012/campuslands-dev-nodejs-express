import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearContenedor } from "../src/contenedor.js";
import { crearApp } from "../src/app.js";

// cada test arma su propio contenedor en memoria: datos limpios y sin compartir nada
let app;
beforeEach(() => {
    app = crearApp(crearContenedor({ repo: "memoria" }));
});

describe("GET /api", () => {
    it("lista los modulos con sus dependencias", async () => {
        const res = await request(app).get("/api");

        assert.equal(res.body.repo, "memoria");
        assert.deepEqual(res.body.modulos, [
            { nombre: "jugadores", ruta: "/api/jugadores", necesita: [] },
            { nombre: "equipos", ruta: "/api/equipos", necesita: ["jugadores"] },
            { nombre: "torneos", ruta: "/api/torneos", necesita: ["equipos"] }
        ]);
    });
});

describe("modulo jugadores", () => {
    it("lista y filtra por region", async () => {
        const todos = await request(app).get("/api/jugadores");
        const na = await request(app).get("/api/jugadores?region=NA");

        assert.equal(todos.body.total, 8);
        assert.deepEqual(na.body.data.map((j) => j.gamertag), ["Ghost", "Frost"]);
    });

    it("crea con elo por defecto 1000", async () => {
        const res = await request(app).post("/api/jugadores").send({ gamertag: "Zed", region: "EU" });

        assert.equal(res.status, 201);
        assert.equal(res.headers.location, "/api/jugadores/9");
        assert.deepEqual(res.body.data, { id: 9, gamertag: "Zed", region: "EU", elo: 1000 });
    });

    it("400, 404 y 409", async () => {
        assert.equal((await request(app).post("/api/jugadores").send({ gamertag: "a b", region: "MARS" })).body.errors.length, 2);
        assert.equal((await request(app).get("/api/jugadores/99")).status, 404);
        assert.equal((await request(app).post("/api/jugadores").send({ gamertag: "viper", region: "NA" })).status, 409);
    });
});

describe("modulo equipos (usa jugadores)", () => {
    it("muestra los jugadores y el elo promedio", async () => {
        const res = await request(app).get("/api/equipos/1");

        assert.equal(res.status, 200);
        assert.equal(res.body.data.eloPromedio, 1990);
        assert.deepEqual(res.body.data.jugadores.map((j) => j.gamertag), ["Viper", "Nova", "Blaze", "Rook", "Ghost"]);
    });

    it("crea un equipo de 5 que no esten en otro", async () => {
        await request(app).post("/api/jugadores").send({ gamertag: "Zed", region: "EU", elo: 1500 });
        await request(app).post("/api/jugadores").send({ gamertag: "Mia", region: "EU", elo: 1700 });

        const res = await request(app).post("/api/equipos").send({ nombre: "Euro Five", jugadorIds: [5, 7, 8, 9, 10] });

        assert.equal(res.status, 201);
        assert.equal(res.body.data.eloPromedio, Math.round((2210 + 2050 + 2400 + 1500 + 1700) / 5));
    });

    it("404 si un jugador no existe (lo dice el modulo de jugadores)", async () => {
        const res = await request(app).post("/api/equipos").send({ nombre: "Fantasmas", jugadorIds: [5, 7, 8, 98, 99] });

        assert.equal(res.status, 404);
        assert.equal(res.body.message, "No existen los jugadores: 98, 99");
    });

    it("409 si un jugador ya tiene equipo y 400 con ids repetidos", async () => {
        const ocupado = await request(app).post("/api/equipos").send({ nombre: "Robados", jugadorIds: [1, 5, 7, 8, 3] });
        assert.equal(ocupado.status, 409);

        const repetidos = await request(app).post("/api/equipos").send({ nombre: "Clones", jugadorIds: [5, 5, 7, 8, 8] });
        assert.deepEqual(repetidos.body.errors, ["jugadorIds tiene ids repetidos"]);
    });
});

describe("modulo torneos (usa equipos)", () => {
    it("inscribe un equipo y descuenta el cupo", async () => {
        const res = await request(app).post("/api/torneos/1/inscripciones").send({ equipoId: 1 });

        assert.equal(res.status, 201);
        assert.equal(res.body.data.cuposLibres, 7);
        assert.deepEqual(res.body.data.equipos, [{ id: 1, nombre: "Quetzal Esports", eloPromedio: 1990 }]);
    });

    it("422 si el equipo no llega al elo minimo", async () => {
        const torneo = await request(app).post("/api/torneos").send({ nombre: "Liga Pro", cupo: 4, eloMinimo: 2000 });
        const res = await request(app).post(`/api/torneos/${torneo.body.data.id}/inscripciones`).send({ equipoId: 1 });

        assert.equal(res.status, 422);
        assert.equal(res.body.message, "Quetzal Esports tiene elo promedio 1990 y el minimo es 2000");
    });

    it("409 si se inscribe dos veces y 404 si el equipo no existe", async () => {
        await request(app).post("/api/torneos/1/inscripciones").send({ equipoId: 1 });

        assert.equal((await request(app).post("/api/torneos/1/inscripciones").send({ equipoId: 1 })).status, 409);
        assert.equal((await request(app).post("/api/torneos/1/inscripciones").send({ equipoId: 9 })).status, 404);
    });

    it("400 con un cupo que no es 4, 8 o 16", async () => {
        const res = await request(app).post("/api/torneos").send({ nombre: "Raro", cupo: 5 });
        assert.equal(res.status, 400);
    });
});
