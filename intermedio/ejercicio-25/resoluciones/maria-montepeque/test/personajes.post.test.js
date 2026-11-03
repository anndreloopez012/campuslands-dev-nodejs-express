import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { appDePrueba } from "../test-helpers/app-de-prueba.js";

describe("POST /api/personajes", () => {
    it("201 con el personaje nuevo y el header Location", async () => {
        const res = await request(appDePrueba())
            .post("/api/personajes")
            .send({ nombre: "  Mirella ", clase: "clerigo" });

        assert.equal(res.status, 201);
        assert.equal(res.headers.location, "/api/personajes/3");
        assert.deepEqual(res.body.data, {
            id: 3,
            nombre: "Mirella",
            clase: "clerigo",
            nivel: 1,
            vida: 100,
            inventario: []
        });
    });

    it("lo creado se puede leer despues en la misma app", async () => {
        const app = appDePrueba();
        const creado = await request(app).post("/api/personajes").send({ nombre: "Brom", clase: "guerrero" });

        const leido = await request(app).get(creado.headers.location);

        assert.equal(leido.status, 200);
        assert.equal(leido.body.data.nombre, "Brom");
    });

    it("cada app empieza limpia (lo del test anterior no esta)", async () => {
        const res = await request(appDePrueba()).get("/api/personajes");
        assert.equal(res.body.total, 2);
    });

    it("400 con la lista de errores", async () => {
        const res = await request(appDePrueba()).post("/api/personajes").send({ nombre: "Al", clase: "pirata" });

        assert.equal(res.status, 400);
        assert.deepEqual(res.body.errors, [
            "nombre debe tener entre 3 y 20 letras",
            "clase debe ser una de: guerrero, mago, arquero, clerigo"
        ]);
    });

    it("400 sin body", async () => {
        const res = await request(appDePrueba()).post("/api/personajes");
        assert.equal(res.status, 400);
    });

    it("400 con JSON mal escrito", async () => {
        const res = await request(appDePrueba())
            .post("/api/personajes")
            .set("Content-Type", "application/json")
            .send('{"nombre": "Brom",');

        assert.equal(res.status, 400);
        assert.equal(res.body.message, "El body no es un JSON valido");
    });

    it("409 si el nombre ya existe sin importar mayusculas", async () => {
        const res = await request(appDePrueba()).post("/api/personajes").send({ nombre: "ALDRIC", clase: "mago" });

        assert.equal(res.status, 409);
        assert.equal(res.body.message, "Ya existe un personaje llamado ALDRIC");
    });
});

describe("POST /api/personajes/:id/subir-nivel", () => {
    it("sube un nivel y suma la vida de su clase", async () => {
        const res = await request(appDePrueba()).post("/api/personajes/1/subir-nivel");

        assert.equal(res.status, 200);
        assert.equal(res.body.data.nivel, 13);
        assert.equal(res.body.data.vida, 260);
    });

    it("409 si ya esta en el nivel maximo", async () => {
        const res = await request(appDePrueba()).post("/api/personajes/2/subir-nivel");

        assert.equal(res.status, 409);
        assert.match(res.body.message, /nivel maximo/);
    });
});

describe("POST /api/personajes/:id/inventario", () => {
    it("201 y el item queda en el inventario", async () => {
        const res = await request(appDePrueba()).post("/api/personajes/1/inventario").send({ item: "pocion" });

        assert.equal(res.status, 201);
        assert.deepEqual(res.body.data.inventario, ["espada", "pocion"]);
    });

    it("409 si el inventario esta lleno", async () => {
        const res = await request(appDePrueba()).post("/api/personajes/2/inventario").send({ item: "anillo" });
        assert.equal(res.status, 409);
    });

    it("400 sin item", async () => {
        const res = await request(appDePrueba()).post("/api/personajes/1/inventario").send({});
        assert.equal(res.status, 400);
    });
});
