import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp as crearAppAntes } from "../antes/app.js";
import { crearApp as crearAppDespues } from "../src/app.js";

// tests de contrato: lo que ve el cliente (status, headers y body)
// la MISMA lista de tests corre contra la version de antes y la de despues
// si el refactor cambia algo de afuera, falla en "despues"

const versiones = [
    ["antes", crearAppAntes],
    ["despues", crearAppDespues]
];

for (const [version, crearApp] of versiones) {
    describe(`contrato (${version})`, () => {
        describe("equipos", () => {
            it("GET /api/equipos lista los 5", async () => {
                const res = await request(crearApp()).get("/api/equipos");
                assert.equal(res.status, 200);
                assert.equal(res.body.total, 5);
            });

            it("GET /api/equipos?modalidad=futsal filtra", async () => {
                const res = await request(crearApp()).get("/api/equipos?modalidad=futsal");
                assert.deepEqual(res.body.data.map((e) => e.nombre), ["Glucosoral", "Bufalos"]);
            });

            it("GET /api/equipos?modalidad=playa da 400", async () => {
                const res = await request(crearApp()).get("/api/equipos?modalidad=playa");
                assert.equal(res.status, 400);
                assert.deepEqual(res.body, { ok: false, message: "modalidad debe ser futbol o futsal" });
            });

            it("GET /api/equipos/:id", async () => {
                const res = await request(crearApp()).get("/api/equipos/3");
                assert.deepEqual(res.body, { ok: true, data: { id: 3, nombre: "Xelaju", modalidad: "futbol", ciudad: "Quetzaltenango" } });
            });

            for (const [id, status, message] of [
                ["99", 404, "No existe el equipo con id 99"],
                ["abc", 400, "El id debe ser un numero entero positivo"],
                ["0", 400, "El id debe ser un numero entero positivo"],
                ["2.5", 400, "El id debe ser un numero entero positivo"]
            ]) {
                it(`GET /api/equipos/${id} da ${status}`, async () => {
                    const res = await request(crearApp()).get(`/api/equipos/${id}`);
                    assert.equal(res.status, status);
                    assert.deepEqual(res.body, { ok: false, message });
                });
            }

            it("POST /api/equipos crea con 201, Location y datos limpios", async () => {
                const res = await request(crearApp())
                    .post("/api/equipos")
                    .send({ nombre: "  Antigua GFC ", modalidad: "futbol", ciudad: " Antigua " });

                assert.equal(res.status, 201);
                assert.equal(res.headers.location, "/api/equipos/6");
                assert.deepEqual(res.body.data, { id: 6, nombre: "Antigua GFC", modalidad: "futbol", ciudad: "Antigua" });
            });

            it("POST /api/equipos con todo malo da 400 con los 3 errores en orden", async () => {
                const res = await request(crearApp()).post("/api/equipos").send({ nombre: "X", modalidad: "playa" });

                assert.equal(res.status, 400);
                assert.deepEqual(res.body, {
                    ok: false,
                    message: "Datos invalidos",
                    errors: ["nombre debe tener entre 3 y 30 letras", "modalidad debe ser futbol o futsal", "ciudad es obligatoria"]
                });
            });

            it("POST /api/equipos sin body da 400", async () => {
                const res = await request(crearApp()).post("/api/equipos");
                assert.equal(res.status, 400);
                assert.equal(res.body.errors.length, 3);
            });

            it("POST /api/equipos con nombre repetido en la misma modalidad da 409", async () => {
                const res = await request(crearApp()).post("/api/equipos").send({ nombre: "municipal", modalidad: "futbol", ciudad: "Guatemala" });
                assert.equal(res.status, 409);
                assert.equal(res.body.message, "Ya existe municipal en futbol");
            });

            it("POST /api/equipos con el mismo nombre en otra modalidad si se puede", async () => {
                const res = await request(crearApp()).post("/api/equipos").send({ nombre: "Municipal", modalidad: "futsal", ciudad: "Guatemala" });
                assert.equal(res.status, 201);
            });

            it("PUT /api/equipos/:id cambia nombre y ciudad", async () => {
                const app = crearApp();
                const res = await request(app).put("/api/equipos/5").send({ nombre: "Bufalos FS", ciudad: "Villa Nueva" });

                assert.equal(res.status, 200);
                assert.deepEqual(res.body.data, { id: 5, nombre: "Bufalos FS", modalidad: "futsal", ciudad: "Villa Nueva" });

                const despues = await request(app).get("/api/equipos/5");
                assert.equal(despues.body.data.nombre, "Bufalos FS");
            });

            it("PUT puede dejar su mismo nombre", async () => {
                const res = await request(crearApp()).put("/api/equipos/1").send({ nombre: "Comunicaciones", ciudad: "Ciudad de Guatemala" });
                assert.equal(res.status, 200);
            });

            it("PUT no deja cambiar la modalidad", async () => {
                const res = await request(crearApp()).put("/api/equipos/1").send({ nombre: "Comunicaciones", ciudad: "Guatemala", modalidad: "futsal" });
                assert.equal(res.status, 400);
                assert.deepEqual(res.body.errors, ["la modalidad no se puede cambiar"]);
            });

            it("PUT con modalidad null se ignora (asi lo hacia la version de antes)", async () => {
                const res = await request(crearApp()).put("/api/equipos/1").send({ nombre: "Comunicaciones", ciudad: "Guatemala", modalidad: null });
                assert.equal(res.status, 200);
            });

            it("PUT con el nombre de otro equipo da 409", async () => {
                const res = await request(crearApp()).put("/api/equipos/1").send({ nombre: "Xelaju", ciudad: "Guatemala" });
                assert.equal(res.status, 409);
            });

            it("PUT a un equipo que no existe da 404 aunque el body este mal", async () => {
                const res = await request(crearApp()).put("/api/equipos/99").send({});
                assert.equal(res.status, 404);
            });

            it("DELETE de un equipo sin partidos da 204 y despues 404", async () => {
                const app = crearApp();
                await request(app).post("/api/equipos").send({ nombre: "Nuevo FC", modalidad: "futbol", ciudad: "Coban" });

                const borrado = await request(app).delete("/api/equipos/6");
                assert.equal(borrado.status, 204);
                assert.equal((await request(app).get("/api/equipos/6")).status, 404);
            });

            it("DELETE de un equipo que ya jugo da 409", async () => {
                const res = await request(crearApp()).delete("/api/equipos/1");
                assert.equal(res.status, 409);
                assert.equal(res.body.message, "No se puede borrar un equipo que ya jugo partidos");
            });
        });

        describe("partidos", () => {
            it("GET /api/partidos?equipoId=1 da los 2 partidos de Comunicaciones", async () => {
                const res = await request(crearApp()).get("/api/partidos?equipoId=1");
                assert.deepEqual(res.body.data.map((p) => p.id), [1, 2]);
            });

            it("GET /api/partidos?equipoId=x da 400", async () => {
                const res = await request(crearApp()).get("/api/partidos?equipoId=x");
                assert.equal(res.status, 400);
            });

            it("POST /api/partidos registra con 201", async () => {
                const res = await request(crearApp()).post("/api/partidos").send({ localId: 2, visitanteId: 3, golesLocal: 3, golesVisitante: 1 });
                assert.equal(res.status, 201);
                assert.deepEqual(res.body.data, { id: 4, localId: 2, visitanteId: 3, golesLocal: 3, golesVisitante: 1 });
            });

            const malos = [
                [{}, 400, "Datos invalidos"],
                [{ localId: 1, visitanteId: 2, golesLocal: -1, golesVisitante: 100 }, 400, "Datos invalidos"],
                [{ localId: 1, visitanteId: 1, golesLocal: 0, golesVisitante: 0 }, 400, "Un equipo no puede jugar contra si mismo"],
                [{ localId: 1, visitanteId: 9, golesLocal: 0, golesVisitante: 0 }, 404, "No existe el equipo con id 9"],
                [{ localId: 9, visitanteId: 8, golesLocal: 0, golesVisitante: 0 }, 404, "No existe el equipo con id 9"],
                [{ localId: 1, visitanteId: 4, golesLocal: 0, golesVisitante: 0 }, 400, "Un equipo de futbol no puede jugar contra uno de futsal"]
            ];

            for (const [body, status, message] of malos) {
                it(`POST /api/partidos ${JSON.stringify(body)} da ${status}`, async () => {
                    const res = await request(crearApp()).post("/api/partidos").send(body);
                    assert.equal(res.status, status);
                    assert.equal(res.body.message, message);
                });
            }

            it("los errores de goles salen en el mismo orden", async () => {
                const res = await request(crearApp()).post("/api/partidos").send({ localId: "1", visitanteId: 2, golesLocal: 1.5 });
                assert.deepEqual(res.body.errors, [
                    "localId debe ser un numero entero",
                    "golesLocal debe ser un entero de 0 a 99",
                    "golesVisitante debe ser un entero de 0 a 99"
                ]);
            });
        });

        describe("tabla", () => {
            it("GET /api/tabla?modalidad=futbol con los datos iniciales", async () => {
                const res = await request(crearApp()).get("/api/tabla?modalidad=futbol");

                assert.equal(res.status, 200);
                assert.equal(res.body.modalidad, "futbol");
                assert.deepEqual(res.body.data, [
                    { equipoId: 3, nombre: "Xelaju", pj: 1, pg: 1, pe: 0, pp: 0, gf: 1, gc: 0, dg: 1, pts: 3 },
                    { equipoId: 2, nombre: "Municipal", pj: 1, pg: 0, pe: 1, pp: 0, gf: 2, gc: 2, dg: 0, pts: 1 },
                    { equipoId: 1, nombre: "Comunicaciones", pj: 2, pg: 0, pe: 1, pp: 1, gf: 2, gc: 3, dg: -1, pts: 1 }
                ]);
            });

            it("desempata por diferencia de gol, goles a favor y nombre", async () => {
                const app = crearApp();
                // Municipal gana 1-0 a Xelaju: los dos quedan con 4 pts... Municipal dg +1, Xelaju dg 0
                await request(app).post("/api/partidos").send({ localId: 2, visitanteId: 3, golesLocal: 1, golesVisitante: 0 });

                const res = await request(app).get("/api/tabla?modalidad=futbol");
                assert.deepEqual(res.body.data.map((f) => [f.nombre, f.pts, f.dg]), [
                    ["Municipal", 4, 1],
                    ["Xelaju", 3, 0],
                    ["Comunicaciones", 1, -1]
                ]);
            });

            it("un equipo nuevo sale con todo en 0", async () => {
                const app = crearApp();
                await request(app).post("/api/equipos").send({ nombre: "Alianza", modalidad: "futsal", ciudad: "Escuintla" });

                const res = await request(app).get("/api/tabla?modalidad=futsal");
                const alianza = res.body.data.find((f) => f.nombre === "Alianza");
                assert.deepEqual(alianza, { equipoId: 6, nombre: "Alianza", pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 });

                // con dg 0 queda arriba de Bufalos que tiene dg -2
                assert.deepEqual(res.body.data.map((f) => f.nombre), ["Glucosoral", "Alianza", "Bufalos"]);
            });

            it("GET /api/tabla sin modalidad da 400", async () => {
                const res = await request(crearApp()).get("/api/tabla");
                assert.equal(res.status, 400);
            });
        });

        describe("generales", () => {
            it("ruta que no existe da 404 con metodo y ruta", async () => {
                const res = await request(crearApp()).patch("/api/equipos/1");
                assert.deepEqual(res.body, { ok: false, message: "La ruta PATCH /api/equipos/1 no existe" });
            });

            it("JSON roto da 400", async () => {
                const res = await request(crearApp()).post("/api/equipos").set("Content-Type", "application/json").send("{malo");
                assert.deepEqual(res.body, { ok: false, message: "El body no es un JSON valido" });
            });

            it("cada crearApp() empieza con sus propios datos", async () => {
                const app1 = crearApp();
                await request(app1).delete("/api/equipos/9");
                await request(app1).post("/api/equipos").send({ nombre: "Solo en app1", modalidad: "futbol", ciudad: "Peten" });

                const app2 = crearApp();
                assert.equal((await request(app2).get("/api/equipos")).body.total, 5);
            });
        });
    });
}
