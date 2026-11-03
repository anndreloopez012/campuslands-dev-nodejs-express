import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import request from "supertest";
import { crearApp } from "../src/app.js";

const LUCIA = { email: "lucia@viajes.com", clave: "lucia12345" };

// saca el valor de la cookie refresh del Set-Cookie
const refreshDe = (res) => decodeURIComponent(res.headers["set-cookie"][0].match(/^refresh=([^;]*)/)[1]);
const cookie = (refresh) => `refresh=${encodeURIComponent(refresh)}`;
const bearer = (res) => `Bearer ${res.body.data.accessToken}`;

async function login(app, quien = LUCIA) {
    return request(app).post("/api/auth/login").set("User-Agent", "telefono-de-lucia").send(quien);
}

describe("login", () => {
    it("da el access en el body y el refresh en una cookie HttpOnly", async () => {
        const res = await login(crearApp());

        assert.equal(res.status, 200);
        assert.equal(res.body.data.tipo, "Bearer");
        assert.match(res.headers["set-cookie"][0], /^refresh=[\w-]{40,}; HttpOnly; SameSite=Strict; Path=\/api\/auth; Max-Age=604800$/);
        assert.equal(res.headers["cache-control"], "no-store");
        // el refresh NO viaja en el body
        assert.doesNotMatch(JSON.stringify(res.body), new RegExp(refreshDe(res)));
    });

    it("en produccion la cookie lleva Secure", async () => {
        const res = await login(crearApp({ produccion: true }));
        assert.match(res.headers["set-cookie"][0], /; Secure$/);
    });

    it("en el servidor el refresh se guarda hasheado, no en texto", async () => {
        const app = crearApp();
        const refresh = refreshDe(await login(app));
        const guardados = app.locals.tokens.guardados();

        assert.ok(!guardados.includes(refresh));
        assert.ok(guardados.includes(createHash("sha256").update(refresh).digest("hex")));
    });

    it("credenciales malas: 401", async () => {
        assert.equal((await login(crearApp(), { email: "lucia@viajes.com", clave: "x" })).status, 401);
    });
});

describe("access token corto", () => {
    it("sirve para las rutas protegidas", async () => {
        const app = crearApp();
        const res = await request(app).get("/api/reservas").set("Authorization", bearer(await login(app)));
        assert.deepEqual(res.body.data.map((r) => r.destino), ["Tikal", "Antigua Guatemala"]);
    });

    it("vence a los 15 minutos con el code ACCESS_VENCIDO, y con el refresh se sigue", async (t) => {
        t.mock.timers.enable({ apis: ["Date"], now: Date.now() });
        const app = crearApp();
        const inicio = await login(app);

        t.mock.timers.tick(15 * 60 * 1000 + 1000);
        const vencido = await request(app).get("/api/reservas").set("Authorization", bearer(inicio));
        assert.equal(vencido.status, 401);
        assert.equal(vencido.body.code, "ACCESS_VENCIDO");

        const nuevo = await request(app).post("/api/auth/refresh").set("Cookie", cookie(refreshDe(inicio)));
        assert.equal(nuevo.status, 200);
        assert.equal((await request(app).get("/api/reservas").set("Authorization", bearer(nuevo))).status, 200);
    });

    it("sin token o con uno inventado: 401", async () => {
        const app = crearApp();
        assert.equal((await request(app).get("/api/reservas")).body.code, "SIN_TOKEN");
        assert.equal((await request(app).get("/api/reservas").set("Authorization", "Bearer abc")).body.code, "ACCESS_INVALIDO");
    });
});

describe("rotacion del refresh", () => {
    it("cada refresh entrega uno nuevo distinto", async () => {
        const app = crearApp();
        const r0 = refreshDe(await login(app));
        const r1 = refreshDe(await request(app).post("/api/auth/refresh").set("Cookie", cookie(r0)));
        const r2 = refreshDe(await request(app).post("/api/auth/refresh").set("Cookie", cookie(r1)));

        assert.notEqual(r0, r1);
        assert.notEqual(r1, r2);
    });

    it("REUSO: usar un refresh viejo cierra toda la familia (el ladron y el dueno)", async () => {
        const app = crearApp();
        const r0 = refreshDe(await login(app));

        // el dueno usa r0 normalmente y recibe r1
        const usoNormal = await request(app).post("/api/auth/refresh").set("Cookie", cookie(r0));
        const r1 = refreshDe(usoNormal);

        // alguien que robo r0 intenta usarlo
        const ladron = await request(app).post("/api/auth/refresh").set("Cookie", cookie(r0));
        assert.equal(ladron.status, 401);
        assert.equal(ladron.body.code, "REFRESH_REUSADO");
        assert.match(ladron.headers["set-cookie"][0], /Max-Age=0/);

        // ahora ni r1 (el del dueno) sirve, ni el access que tenia
        assert.equal((await request(app).post("/api/auth/refresh").set("Cookie", cookie(r1))).body.code, "SESION_REVOCADA");
        assert.equal((await request(app).get("/api/reservas").set("Authorization", bearer(usoNormal))).body.code, "SESION_REVOCADA");

        assert.equal(app.locals.tokens.registro[0].evento, "reuso_detectado");
    });

    it("el reuso solo cierra esa familia, no las otras sesiones del usuario", async () => {
        const app = crearApp();
        const telefono = refreshDe(await login(app));
        const compu = await login(app);

        await request(app).post("/api/auth/refresh").set("Cookie", cookie(telefono));
        await request(app).post("/api/auth/refresh").set("Cookie", cookie(telefono));

        assert.equal((await request(app).post("/api/auth/refresh").set("Cookie", cookie(refreshDe(compu)))).status, 200);
    });

    it("el refresh vence a los 7 dias", async (t) => {
        t.mock.timers.enable({ apis: ["Date"], now: Date.now() });
        const app = crearApp();
        const r0 = refreshDe(await login(app));

        t.mock.timers.tick(7 * 24 * 3600 * 1000);
        assert.equal((await request(app).post("/api/auth/refresh").set("Cookie", cookie(r0))).body.code, "REFRESH_VENCIDO");
    });

    it("sin cookie o con una inventada: REFRESH_INVALIDO", async () => {
        const app = crearApp();
        assert.equal((await request(app).post("/api/auth/refresh")).body.code, "REFRESH_INVALIDO");
        assert.equal((await request(app).post("/api/auth/refresh").set("Cookie", "refresh=inventado")).body.code, "REFRESH_INVALIDO");
    });
});

describe("cerrar sesiones", () => {
    it("logout cierra esta sesion: su refresh y su access dejan de servir", async () => {
        const app = crearApp();
        const inicio = await login(app);
        const r0 = refreshDe(inicio);

        const salida = await request(app).post("/api/auth/logout").set("Cookie", cookie(r0));
        assert.equal(salida.status, 204);
        assert.match(salida.headers["set-cookie"][0], /Max-Age=0/);

        assert.equal((await request(app).post("/api/auth/refresh").set("Cookie", cookie(r0))).body.code, "SESION_REVOCADA");
        assert.equal((await request(app).get("/api/reservas").set("Authorization", bearer(inicio))).status, 401);
    });

    it("ver sesiones activas y cerrar todas", async () => {
        const app = crearApp();
        await login(app);
        const actual = await login(app);

        const sesiones = await request(app).get("/api/auth/sesiones").set("Authorization", bearer(actual));
        assert.equal(sesiones.body.data.length, 2);
        assert.equal(sesiones.body.data.filter((s) => s.actual).length, 1);
        assert.equal(sesiones.body.data[0].dispositivo, "telefono-de-lucia");

        const todas = await request(app).post("/api/auth/logout-todas").set("Authorization", bearer(actual));
        assert.equal(todas.body.data.sesionesCerradas, 2);
        assert.equal((await request(app).get("/api/reservas").set("Authorization", bearer(actual))).status, 401);
    });

    it("cerrar las sesiones de Lucia no toca las de Pedro", async () => {
        const app = crearApp();
        const lucia = await login(app);
        const pedro = await login(app, { email: "pedro@viajes.com", clave: "pedro12345" });

        await request(app).post("/api/auth/logout-todas").set("Authorization", bearer(lucia));
        const reservas = await request(app).get("/api/reservas").set("Authorization", bearer(pedro));
        assert.deepEqual(reservas.body.data.map((r) => r.destino), ["Lago de Atitlan"]);
    });
});
