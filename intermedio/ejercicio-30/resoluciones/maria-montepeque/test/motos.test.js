import { describe, it, before, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { resetDb } from "../src/data/db.js";
import { app, request, todasLasSesiones } from "../test-helpers/sesiones.js";

const MOTO_NUEVA = {
    placa: "m111zzz",
    marca: "Italika",
    modelo: "FT150",
    anio: 2024,
    cilindraje: 150,
    km: 0,
    propietario: { nombre: "Rosa Mendez", telefono: "12345678" }
};

describe("motos", () => {
    let s;

    before(async () => {
        resetDb();
        s = await todasLasSesiones();
    });

    beforeEach(() => resetDb());

    describe("listar con filtros, busqueda, orden y paginacion", () => {
        it("por defecto pagina 1 de 10 con meta", async () => {
            const res = await request(app).get("/api/motos").set(s.beto);

            assert.equal(res.status, 200);
            assert.deepEqual(res.body.meta, { page: 1, limit: 10, total: 6, totalPages: 1 });
        });

        it("limit y page", async () => {
            const res = await request(app).get("/api/motos?limit=4&page=2").set(s.beto);

            assert.deepEqual(res.body.meta, { page: 2, limit: 4, total: 6, totalPages: 2 });
            assert.deepEqual(res.body.data.map((m) => m.id), [5, 6]);
        });

        it("una pagina que no existe viene vacia, no da error", async () => {
            const res = await request(app).get("/api/motos?page=9").set(s.beto);
            assert.deepEqual(res.body.data, []);
        });

        it("filtra por marca sin importar mayusculas", async () => {
            const res = await request(app).get("/api/motos?marca=HONDA").set(s.beto);
            assert.deepEqual(res.body.data.map((m) => m.placa), ["M123ABC", "M321JKL"]);
        });

        it("busca con q en placa, modelo y propietario", async () => {
            const porPlaca = await request(app).get("/api/motos?q=456d").set(s.beto);
            const porDueno = await request(app).get("/api/motos?q=sofia").set(s.beto);

            assert.deepEqual(porPlaca.body.data.map((m) => m.id), [2]);
            assert.deepEqual(porDueno.body.data.map((m) => m.id), [4]);
        });

        it("ordena por -anio y de empate por km", async () => {
            const res = await request(app).get("/api/motos?sort=-anio,km&limit=3").set(s.beto);
            assert.deepEqual(res.body.data.map((m) => m.anio), [2023, 2022, 2021]);
        });

        it("todo junto: Honda desde 2019 ordenada por km", async () => {
            const res = await request(app).get("/api/motos?marca=honda&anioDesde=2019&sort=km").set(s.beto);
            assert.deepEqual(res.body.data.map((m) => m.placa), ["M123ABC"]);
        });

        for (const [query, mensaje] of [
            ["limit=0", /limit debe ser un entero/],
            ["limit=100", /no puede pasar de 50/],
            ["page=abc", /page debe ser un entero/],
            ["sort=propietario", /No se puede ordenar por "propietario"/],
            ["q=a", /al menos 2 letras/],
            ["anioDesde=dos", /anioDesde/]
        ]) {
            it(`400 con ?${query}`, async () => {
                const res = await request(app).get(`/api/motos?${query}`).set(s.beto);
                assert.equal(res.status, 400);
                assert.match(res.body.message, mensaje);
            });
        }
    });

    describe("crear", () => {
        it("recepcion crea: placa en mayusculas, 201 y Location", async () => {
            const res = await request(app).post("/api/motos").set(s.recepcion).send(MOTO_NUEVA);

            assert.equal(res.status, 201);
            assert.equal(res.headers.location, "/api/motos/7");
            assert.equal(res.body.data.placa, "M111ZZZ");
        });

        it("409 con una placa repetida", async () => {
            const res = await request(app).post("/api/motos").set(s.admin).send({ ...MOTO_NUEVA, placa: "M123ABC" });
            assert.equal(res.status, 409);
        });

        it("400 con todos los errores juntos", async () => {
            const res = await request(app).post("/api/motos").set(s.recepcion).send({ placa: "P123ABC", anio: 1970, propietario: { telefono: "123" } });

            assert.equal(res.status, 400);
            assert.deepEqual(res.body.errors, [
                "placa debe tener el formato M123ABC",
                "marca debe tener entre 2 y 30 letras",
                "modelo es obligatorio",
                `anio debe ser un entero entre 1980 y ${new Date().getFullYear() + 1}`,
                "cilindraje debe ser un entero entre 50 y 2000",
                "km debe ser un entero de 0 para arriba",
                "propietario.nombre es obligatorio",
                "propietario.telefono debe tener 8 numeros"
            ]);
        });

        it("un mecanico no puede registrar motos", async () => {
            const res = await request(app).post("/api/motos").set(s.beto).send(MOTO_NUEVA);
            assert.equal(res.status, 403);
        });
    });

    describe("ver", () => {
        it("200, 404 y 400", async () => {
            assert.equal((await request(app).get("/api/motos/1").set(s.carla)).status, 200);
            assert.equal((await request(app).get("/api/motos/99").set(s.carla)).status, 404);

            const malo = await request(app).get("/api/motos/abc").set(s.carla);
            assert.equal(malo.status, 400);
            assert.equal(malo.body.message, "El id de la moto debe ser un numero entero positivo");
        });

        it("sin token da 401", async () => {
            assert.equal((await request(app).get("/api/motos")).status, 401);
        });
    });
});
