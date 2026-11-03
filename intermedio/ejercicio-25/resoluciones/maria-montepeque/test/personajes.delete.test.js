import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { appDePrueba, TOKEN_GM } from "../test-helpers/app-de-prueba.js";

describe("DELETE /api/personajes/:id (solo GM)", () => {
    it("401 sin token", async () => {
        const res = await request(appDePrueba()).delete("/api/personajes/1");

        assert.equal(res.status, 401);
        assert.equal(res.body.message, "Falta el token del GM");
    });

    it("401 si el header no es Bearer", async () => {
        const res = await request(appDePrueba()).delete("/api/personajes/1").set("Authorization", TOKEN_GM);
        assert.equal(res.status, 401);
    });

    it("403 con un token que no es del GM", async () => {
        const res = await request(appDePrueba()).delete("/api/personajes/1").set("Authorization", "Bearer otro");
        assert.equal(res.status, 403);
    });

    it("204 sin body con el token correcto, y despues da 404", async () => {
        const app = appDePrueba();

        const borrado = await request(app).delete("/api/personajes/1").set("Authorization", `Bearer ${TOKEN_GM}`);
        assert.equal(borrado.status, 204);
        assert.equal(borrado.text, "");

        const despues = await request(app).get("/api/personajes/1");
        assert.equal(despues.status, 404);
    });

    it("el token se revisa antes que el id", async () => {
        // sin token no deberia decir si el personaje existe o no
        const res = await request(appDePrueba()).delete("/api/personajes/999");
        assert.equal(res.status, 401);
    });

    it("404 con token si el personaje no existe", async () => {
        const res = await request(appDePrueba()).delete("/api/personajes/999").set("Authorization", `Bearer ${TOKEN_GM}`);
        assert.equal(res.status, 404);
    });
});
