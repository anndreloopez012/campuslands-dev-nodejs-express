import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import request from "supertest";
import app from "../src/app.js";
import { resetDb } from "../src/data/db.js";

// mando los ejemplos que estan escritos en la documentacion
// si alguien cambia la api y no el ejemplo, este test falla

const openapi = JSON.parse(readFileSync(new URL("../docs/openapi.json", import.meta.url), "utf8"));
const API_KEY = "clave-de-desarrollo";

function ejemploDe(ruta, metodo) {
    return openapi.paths[ruta][metodo].requestBody.content["application/json"].example;
}

describe("los ejemplos de la documentacion funcionan", () => {
    beforeEach(() => resetDb());

    it("POST /api/equipos con el ejemplo da 201 y el Location documentado", async () => {
        const res = await request(app).post("/api/equipos").set("x-api-key", API_KEY).send(ejemploDe("/api/equipos", "post"));

        assert.equal(res.status, 201);
        const locationEjemplo = openapi.paths["/api/equipos"].post.responses["201"].headers.Location.schema.example;
        assert.equal(res.headers.location, locationEjemplo);
    });

    it("POST /api/partidas con el ejemplo da 201", async () => {
        const res = await request(app).post("/api/partidas").set("x-api-key", API_KEY).send(ejemploDe("/api/partidas", "post"));
        assert.equal(res.status, 201);
    });

    it("los mensajes de error de ejemplo son los mismos que da la api", async () => {
        const { responses } = openapi.components;
        const ejemplo = (nombre) => responses[nombre].content["application/json"].example;

        const sinKey = await request(app).post("/api/equipos").send({});
        assert.deepEqual(sinKey.body, ejemplo("SinApiKey"));

        const keyMala = await request(app).post("/api/equipos").set("x-api-key", "otra").send({});
        assert.deepEqual(keyMala.body, ejemplo("ApiKeyIncorrecta"));

        const noExiste = await request(app).get("/api/equipos/99");
        assert.deepEqual(noExiste.body, ejemplo("EquipoNoExiste"));

        const idMalo = await request(app).get("/api/equipos/abc");
        assert.deepEqual(idMalo.body, ejemplo("IdInvalido"));
    });

    it("el ejemplo de jugadores coincide con el equipo 1", async () => {
        const res = await request(app).get("/api/equipos/1/jugadores");
        const schema = openapi.paths["/api/equipos/{id}/jugadores"].get.responses["200"].content["application/json"].schema;

        assert.equal(res.body.equipo, schema.properties.equipo.example);
        assert.deepEqual(res.body.data, schema.properties.data.example);
    });
});

describe("reglas de la liga", () => {
    beforeEach(() => resetDb());

    it("clasificacion: 3 puntos por victoria y ordenada", async () => {
        const res = await request(app).get("/api/clasificacion");

        assert.equal(res.status, 200);
        assert.deepEqual(
            res.body.data.map((f) => [f.nombre, f.puntos]),
            [["Red Lotus", 3], ["Quetzal Gaming", 3], ["Nordic Titans", 0], ["Storm Wolves", 0]]
        );
    });

    it("una partida nueva cambia la clasificacion", async () => {
        await request(app).post("/api/partidas").set("x-api-key", API_KEY).send({ equipoAzulId: 4, equipoRojoId: 2, ganador: "azul", duracionMin: 30 });

        const res = await request(app).get("/api/clasificacion");
        assert.equal(res.body.data.find((f) => f.nombre === "Nordic Titans").puntos, 3);
    });

    it("filtra equipos por region y rechaza regiones que no existen", async () => {
        const kr = await request(app).get("/api/equipos?region=KR");
        assert.deepEqual(kr.body.data.map((e) => e.nombre), ["Red Lotus"]);

        const mala = await request(app).get("/api/equipos?region=MARS");
        assert.equal(mala.status, 400);
    });

    it("409 con un nombre repetido y 400 con un equipo de 4", async () => {
        const repetido = await request(app)
            .post("/api/equipos")
            .set("x-api-key", API_KEY)
            .send({ nombre: "red lotus", region: "KR", jugadores: ["a", "b", "c", "d", "e"] });
        assert.equal(repetido.status, 409);

        const incompleto = await request(app)
            .post("/api/equipos")
            .set("x-api-key", API_KEY)
            .send({ nombre: "Nuevo", region: "EU", jugadores: ["a", "b", "c", "d"] });
        assert.equal(incompleto.status, 400);
    });

    it("partida contra si mismo da 400 y con equipo inexistente 404", async () => {
        const mismo = await request(app).post("/api/partidas").set("x-api-key", API_KEY).send({ equipoAzulId: 1, equipoRojoId: 1, ganador: "azul", duracionMin: 30 });
        assert.equal(mismo.status, 400);

        const noExiste = await request(app).post("/api/partidas").set("x-api-key", API_KEY).send({ equipoAzulId: 1, equipoRojoId: 9, ganador: "rojo", duracionMin: 30 });
        assert.equal(noExiste.status, 404);
    });
});
