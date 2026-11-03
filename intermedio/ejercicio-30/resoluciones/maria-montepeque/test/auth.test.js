import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";
import config from "../src/config.js";
import { resetDb } from "../src/data/db.js";
import { app, request, auth, USUARIOS } from "../test-helpers/sesiones.js";

describe("auth", () => {
    beforeEach(() => resetDb());

    it("login correcto da un token y el usuario sin passwordHash", async () => {
        const res = await request(app).post("/api/auth/login").send(USUARIOS.recepcion);

        assert.equal(res.status, 200);
        assert.equal(typeof res.body.data.token, "string");
        assert.deepEqual(res.body.data.usuario, { id: 1, nombre: "Ana Recepcion", email: "ana@taller.com", rol: "recepcion" });
    });

    it("el email no distingue mayusculas", async () => {
        const res = await request(app).post("/api/auth/login").send({ email: " ANA@taller.com ", password: "recepcion123" });
        assert.equal(res.status, 200);
    });

    it("clave mala y email que no existe dan el mismo 401", async () => {
        const mala = await request(app).post("/api/auth/login").send({ email: "ana@taller.com", password: "otra" });
        const noExiste = await request(app).post("/api/auth/login").send({ email: "nadie@taller.com", password: "otra" });

        assert.equal(mala.status, 401);
        assert.equal(noExiste.status, 401);
        assert.equal(mala.body.message, noExiste.body.message);
    });

    it("400 sin email o password", async () => {
        const res = await request(app).post("/api/auth/login").send({ email: "ana@taller.com" });
        assert.equal(res.status, 400);
    });

    it("despues de 5 fallos bloquea con 429 y Retry-After, aunque la clave sea correcta", async () => {
        for (let i = 0; i < 5; i++) {
            const fallo = await request(app).post("/api/auth/login").send({ email: "beto@taller.com", password: "mal" });
            assert.equal(fallo.status, 401);
        }

        const bloqueado = await request(app).post("/api/auth/login").send(USUARIOS.beto);
        assert.equal(bloqueado.status, 429);
        assert.ok(Number(bloqueado.headers["retry-after"]) > 0);

        // a otro usuario no le afecta
        const otro = await request(app).post("/api/auth/login").send(USUARIOS.carla);
        assert.equal(otro.status, 200);
    });

    it("un login correcto borra los fallos anteriores", async () => {
        for (let i = 0; i < 4; i++) {
            await request(app).post("/api/auth/login").send({ email: "beto@taller.com", password: "mal" });
        }
        assert.equal((await request(app).post("/api/auth/login").send(USUARIOS.beto)).status, 200);

        // ahora puede volver a fallar 4 veces sin bloqueo
        for (let i = 0; i < 4; i++) {
            await request(app).post("/api/auth/login").send({ email: "beto@taller.com", password: "mal" });
        }
        assert.equal((await request(app).post("/api/auth/login").send(USUARIOS.beto)).status, 200);
    });

    it("el bloqueo se va cuando pasa el tiempo", async (t) => {
        t.mock.timers.enable({ apis: ["Date"], now: Date.now() });

        for (let i = 0; i < 5; i++) {
            await request(app).post("/api/auth/login").send({ email: "beto@taller.com", password: "mal" });
        }
        assert.equal((await request(app).post("/api/auth/login").send(USUARIOS.beto)).status, 429);

        t.mock.timers.tick(config.loginBloqueoMs);
        assert.equal((await request(app).post("/api/auth/login").send(USUARIOS.beto)).status, 200);
    });

    it("GET /api/auth/yo con token", async () => {
        const res = await request(app).get("/api/auth/yo").set(await auth("admin"));
        assert.equal(res.status, 200);
        assert.equal(res.body.data.rol, "admin");
    });

    it("401 sin token, con token roto y con token vencido", async () => {
        assert.equal((await request(app).get("/api/auth/yo")).status, 401);
        assert.equal((await request(app).get("/api/auth/yo").set("Authorization", "Bearer abc")).status, 401);

        const vencido = jwt.sign({ sub: 1, rol: "recepcion", exp: Math.floor(Date.now() / 1000) - 60 }, config.jwtSecret);
        const res = await request(app).get("/api/auth/yo").set("Authorization", `Bearer ${vencido}`);
        assert.equal(res.status, 401);
        assert.equal(res.body.message, "El token expiro, vuelve a hacer login");
    });

    it("un token firmado con otro secreto no sirve", async () => {
        const falso = jwt.sign({ sub: 4, rol: "admin" }, "otro-secreto");
        const res = await request(app).get("/api/auth/yo").set("Authorization", `Bearer ${falso}`);
        assert.equal(res.status, 401);
    });

    it("cambiar el rol dentro del token no da permisos (el rol sale del usuario)", async () => {
        // aunque el token diga admin, el middleware busca al usuario 1 y usa su rol real (recepcion)
        const trucado = jwt.sign({ sub: 1, rol: "admin" }, config.jwtSecret);
        const res = await request(app).patch("/api/repuestos/1/stock").set("Authorization", `Bearer ${trucado}`).send({ stock: 99 });
        assert.equal(res.status, 403);
    });
});

describe("generales", () => {
    it("cada respuesta lleva X-Request-Id y los errores tambien lo traen en el body", async () => {
        const res = await request(app).get("/api/nada");

        assert.equal(res.status, 404);
        assert.ok(res.headers["x-request-id"]);
        assert.equal(res.body.requestId, res.headers["x-request-id"]);
    });

    it("reusa el X-Request-Id que manda el cliente si es valido", async () => {
        const res = await request(app).get("/health").set("X-Request-Id", "mi-id-12345");
        assert.equal(res.headers["x-request-id"], "mi-id-12345");
    });

    it("JSON roto da 400 y body gigante da 413", async () => {
        const roto = await request(app).post("/api/auth/login").set("Content-Type", "application/json").send("{malo");
        assert.equal(roto.status, 400);

        const gigante = await request(app).post("/api/auth/login").send({ email: "x".repeat(30_000), password: "x" });
        assert.equal(gigante.status, 413);
    });
});
