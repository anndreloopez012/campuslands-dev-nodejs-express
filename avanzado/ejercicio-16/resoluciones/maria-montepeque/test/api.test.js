import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

describe("ataques por HTTP", () => {
    it("body con __proto__ da 400 y no contamina nada", async () => {
        const app = crearApp();
        const res = await request(app).patch("/api/perfil").set("Content-Type", "application/json").send('{"preferencias":{"__proto__":{"esAdmin":true}}}');

        assert.equal(res.status, 400);
        assert.deepEqual(res.body.errors, ["body.preferencias.__proto__"]);
        assert.equal({}.esAdmin, undefined);
    });

    it("PATCH /api/perfil: no se puede cambiar rol ni saldo (mass assignment)", async () => {
        const app = crearApp();
        const res = await request(app).patch("/api/perfil").send({ nombre: "  Diana​ Street ", rol: "admin", saldo: 1_000_000, preferencias: { colores: ["blanco"] } });

        assert.equal(res.status, 200);
        assert.equal(res.body.data.nombre, "Diana Street");
        assert.equal(res.body.data.rol, "cliente");
        assert.equal(res.body.data.saldo, 0);
        assert.deepEqual(res.body.data.preferencias, { tallas: [38], colores: ["blanco"] });
    });

    it("reseña: se quita el HTML, se limpia el texto y solo se guardan los campos permitidos", async () => {
        const app = crearApp();
        const res = await request(app)
            .post("/api/productos/1/resenas")
            .send({ autor: " Marco\u0000 ", texto: "Muy <b>comodos</b><script>fetch('/robar')</script>", calificacion: "5", aprobada: true, id: 999 });

        assert.equal(res.status, 201);
        assert.deepEqual(res.body.data, { id: 1, productoId: 1, autor: "Marco", texto: "Muy comodos", calificacion: 5 });
    });

    it("reseña: un texto que es solo HTML queda vacio y se rechaza; objetos en vez de texto tambien", async () => {
        const app = crearApp();
        const res = await request(app).post("/api/productos/1/resenas").send({ autor: { $gt: "" }, texto: "<script>x</script>", calificacion: "1e309" });

        assert.equal(res.status, 400);
        assert.equal(res.body.errors.length, 3);
    });

    it("busqueda: los parentesis se buscan como texto y un patron raro no rompe nada", async () => {
        const app = crearApp();
        assert.deepEqual((await request(app).get("/api/productos").query({ q: "(Hi)" })).body.data.map((p) => p.id), [5]);
        assert.deepEqual((await request(app).get("/api/productos").query({ q: ".*" })).body.data, []);
        assert.equal((await request(app).get("/api/productos").query({ q: "(a+)+$" })).status, 200);
    });

    it("?marca repetida (parameter pollution) da 400", async () => {
        const app = crearApp();
        const res = await request(app).get("/api/productos?marca=nike&marca=adidas");
        assert.equal(res.status, 400);
        assert.equal((await request(app).get("/api/productos?marca=nike")).body.data.length, 2);
    });

    it("imagenes: se lee la permitida y no se puede salir de la carpeta", async () => {
        const app = crearApp();
        assert.equal((await request(app).get("/api/imagenes/air-max-90.txt")).text, "imagen falsa de Air Max 90\n");

        for (const malo of ["..%2Fsecreto.txt", "..%5Csecreto.txt", "%2E%2E%2Fsecreto.txt", ".env"]) {
            const res = await request(app).get(`/api/imagenes/${malo}`);
            assert.equal(res.status, 400, malo);
            assert.doesNotMatch(res.text, /CLAVE_SECRETA/);
        }
        assert.equal((await request(app).get("/api/imagenes/no-existe.txt")).status, 404);
    });
});
