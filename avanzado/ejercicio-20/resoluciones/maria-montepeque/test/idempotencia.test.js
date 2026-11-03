import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

const pedido = { estilo: "color", descripcion: "Dragon de acuarela digital", personajes: 1 };

const encargar = (app, llave, body = pedido, usuario = "ana") => {
    const r = request(app).post("/api/encargos").set("X-Usuario", usuario);
    if (llave) r.set("Idempotency-Key", llave);
    return r.send(body);
};

describe("el caso feliz", () => {
    it("la primera vez cobra y responde 201", async () => {
        const app = crearApp({ demoraCobroMs: 0 });
        const res = await encargar(app, "llave-0001");
        assert.equal(res.status, 201);
        assert.equal(res.headers["idempotency-replayed"], "false");
        assert.equal(res.body.saldo, 120);
    });

    it("repetir con la misma llave devuelve LA MISMA respuesta y no cobra otra vez", async () => {
        const app = crearApp({ demoraCobroMs: 0 });
        const primera = await encargar(app, "llave-0001");
        const segunda = await encargar(app, "llave-0001");

        assert.equal(segunda.status, 201);
        assert.equal(segunda.headers["idempotency-replayed"], "true");
        assert.deepEqual(segunda.body, primera.body);
        assert.equal(app.locals.encargos.saldo("ana"), 120);
        assert.equal(app.locals.encargos.listar("ana").length, 1);
    });

    it("llaves distintas son operaciones distintas", async () => {
        const app = crearApp({ demoraCobroMs: 0 });
        await encargar(app, "llave-0001");
        await encargar(app, "llave-0002");
        assert.equal(app.locals.encargos.saldo("ana"), 40);
    });

    it("la llave es por usuario: dos usuarios con la misma llave no se pisan", async () => {
        const app = crearApp({ demoraCobroMs: 0 });
        await encargar(app, "llave-compartida");
        const deBeto = await encargar(app, "llave-compartida", { estilo: "boceto", descripcion: "Gato en pixel art" }, "beto");
        assert.equal(deBeto.headers["idempotency-replayed"], "false");
        assert.equal(deBeto.body.data.usuario, "beto");
    });
});

describe("casos raros", () => {
    it("400 sin llave o con una llave invalida, y no se cobra", async () => {
        const app = crearApp({ demoraCobroMs: 0 });
        assert.equal((await encargar(app, null)).status, 400);
        assert.equal((await encargar(app, "corta")).status, 400);
        assert.equal((await encargar(app, "con espacios!!")).status, 400);
        assert.equal(app.locals.encargos.saldo("ana"), 200);
    });

    it("422 si se reusa la llave con otro body", async () => {
        const app = crearApp({ demoraCobroMs: 0 });
        await encargar(app, "llave-0001");
        const res = await encargar(app, "llave-0001", { ...pedido, personajes: 2 });
        assert.equal(res.status, 422);
        assert.equal(app.locals.encargos.saldo("ana"), 120);
    });

    it("doble click: dos pedidos a la vez con la misma llave -> uno cobra, el otro 409", async () => {
        const app = crearApp({ demoraCobroMs: 80 });
        const [a, b] = await Promise.all([encargar(app, "llave-0001"), encargar(app, "llave-0001")]);

        assert.deepEqual([a.status, b.status].sort(), [201, 409]);
        const elDe409 = a.status === 409 ? a : b;
        assert.equal(elDe409.headers["retry-after"], "1");
        assert.equal(app.locals.encargos.saldo("ana"), 120);

        // ya termino: ahora la repeticion devuelve el 201 guardado
        const despues = await encargar(app, "llave-0001");
        assert.equal(despues.status, 201);
        assert.equal(despues.headers["idempotency-replayed"], "true");
    });

    it("los errores 4xx tambien se guardan (repetir da el mismo 402)", async () => {
        const app = crearApp({ demoraCobroMs: 0 });
        const caro = { estilo: "animado", descripcion: "Intro animada del canal" };
        const primera = await encargar(app, "llave-pobre", caro, "beto");
        const segunda = await encargar(app, "llave-pobre", caro, "beto");
        assert.equal(primera.status, 402);
        assert.equal(segunda.status, 402);
        assert.equal(segunda.headers["idempotency-replayed"], "true");
    });

    it("si falla el servidor (500), la llave se suelta y se puede reintentar", async () => {
        let intentos = 0;
        const pasarela = async () => {
            intentos++;
            if (intentos === 1) throw new Error("pasarela caida");
            return { cobroId: "cob_ok" };
        };
        const app = crearApp({ pasarela });

        assert.equal((await encargar(app, "llave-0001")).status, 500);
        const reintento = await encargar(app, "llave-0001");
        assert.equal(reintento.status, 201);
        assert.equal(reintento.headers["idempotency-replayed"], "false");
        assert.equal(intentos, 2);
    });

    it("la llave vence despues del TTL", async () => {
        let ahora = 1_000_000;
        const app = crearApp({ demoraCobroMs: 0, ttlMs: 60_000, reloj: () => ahora });
        await encargar(app, "llave-0001");

        ahora += 59_000;
        assert.equal((await encargar(app, "llave-0001")).headers["idempotency-replayed"], "true");

        ahora += 2_000;
        const nueva = await encargar(app, "llave-0001");
        assert.equal(nueva.headers["idempotency-replayed"], "false");
        assert.equal(app.locals.encargos.saldo("ana"), 40);
    });

    it("GET no pide llave", async () => {
        const app = crearApp();
        const res = await request(app).get("/api/encargos").set("X-Usuario", "ana");
        assert.equal(res.status, 200);
        assert.equal(res.body.saldo, 200);
    });
});
