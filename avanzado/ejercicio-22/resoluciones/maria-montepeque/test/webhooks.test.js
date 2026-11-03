import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";
import { crearEmisor } from "../src/webhooks/emisor.js";
import { firmar, verificarFirma } from "../src/webhooks/firma.js";

const SECRETO = "secreto-granja-de-pruebas";
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

function mandarWebhook(app, evento, { secreto = SECRETO, t } = {}) {
    const cuerpo = JSON.stringify(evento);
    return request(app).post("/webhooks/granja").set("Content-Type", "application/json").set("X-Firma", firmar(secreto, cuerpo, t)).send(cuerpo);
}

// un "suscriptor" falso que anota lo que le llega y responde lo que le digamos
function destinoFalso(respuestas = []) {
    const llamadas = [];
    const enviar = async (url, { headers, cuerpo }) => {
        llamadas.push({ url, headers, cuerpo });
        const r = respuestas.shift() ?? 200;
        if (r instanceof Error) throw r;
        return { status: r };
    };
    return { enviar, llamadas };
}

describe("recibir webhooks de la granja", () => {
    it("acepta uno bien firmado y actualiza el proyecto", async () => {
        const app = crearApp({ secretoGranja: SECRETO });
        const res = await mandarWebhook(app, { id: "evt_1", tipo: "render.iniciado", datos: { proyectoId: "casa-lago" } });
        assert.equal(res.status, 200);
        assert.equal(res.body.aplicado, true);
        assert.equal((await request(app).get("/api/proyectos/casa-lago")).body.data.estado, "renderizando");
    });

    it("401 con firma mala y el proyecto no cambia", async () => {
        const app = crearApp({ secretoGranja: SECRETO });
        const res = await mandarWebhook(app, { id: "evt_1", tipo: "render.iniciado", datos: { proyectoId: "casa-lago" } }, { secreto: "secreto-del-atacante-xx" });
        assert.equal(res.status, 401);
        assert.equal((await request(app).get("/api/proyectos/casa-lago")).body.data.estado, "esperando");
    });

    it("el mismo evento dos veces solo se aplica una (dedupe por id)", async () => {
        const app = crearApp({ secretoGranja: SECRETO });
        const evento = { id: "evt_9", tipo: "render.iniciado", datos: { proyectoId: "torre-norte" } };
        await mandarWebhook(app, evento);
        const repetido = await mandarWebhook(app, evento);
        assert.equal(repetido.status, 200);
        assert.equal(repetido.body.duplicado, true);
    });

    it("eventos desordenados se ignoran sin romper (completado antes de iniciado)", async () => {
        const app = crearApp({ secretoGranja: SECRETO });
        const res = await mandarWebhook(app, { id: "evt_2", tipo: "render.completado", datos: { proyectoId: "casa-lago", url: "x.png" } });
        assert.equal(res.body.aplicado, false);
        assert.match(res.body.motivo, /esperando a listo/);
    });
});

describe("emisor con reintentos", () => {
    const suscriptor = { url: "http://cliente.test/hooks", eventos: ["proyecto.*"], secreto: "secreto-del-cliente-1" };

    it("firma cada entrega y el cliente la puede verificar", async () => {
        const destino = destinoFalso();
        const emisor = crearEmisor({ enviar: destino.enviar, esperar: async () => {} });
        emisor.suscribir(suscriptor);
        await emisor.emitir("proyecto.listo", { id: "casa-lago" });

        const { headers, cuerpo } = destino.llamadas[0];
        assert.equal(verificarFirma(suscriptor.secreto, cuerpo, headers["X-Firma"]).valida, true);
        assert.equal(headers["X-Evento-Tipo"], "proyecto.listo");
        assert.equal(JSON.parse(cuerpo).datos.id, "casa-lago");
    });

    it("reintenta con espera exponencial hasta que funciona", async () => {
        const destino = destinoFalso([500, new Error("ECONNRESET"), 200]);
        const esperas = [];
        const emisor = crearEmisor({ enviar: destino.enviar, baseMs: 100, esperar: async (ms) => esperas.push(ms) });
        emisor.suscribir(suscriptor);
        const { entregas } = await emisor.emitir("proyecto.listo", {});

        assert.equal(entregas[0].estado, "entregado");
        assert.deepEqual(esperas, [100, 200]);
        assert.deepEqual(destino.llamadas.map((l) => l.headers["X-Intento"]), ["1", "2", "3"]);
    });

    it("si se acaban los intentos queda en muertos y se puede reintentar a mano", async () => {
        const destino = destinoFalso([503, 503, 503, 503, 200]);
        const emisor = crearEmisor({ enviar: destino.enviar, intentos: 4, esperar: async () => {} });
        emisor.suscribir(suscriptor);
        await emisor.emitir("proyecto.fallido", {});
        assert.equal(emisor.muertos().length, 1);

        const otraVez = await emisor.reintentarMuerto(0);
        assert.equal(otraVez.estado, "entregado");
        assert.equal(emisor.muertos().length, 0);
    });

    it("un 400 del cliente no se reintenta (no se va a arreglar solo)", async () => {
        const destino = destinoFalso([400]);
        const emisor = crearEmisor({ enviar: destino.enviar, esperar: async () => {} });
        emisor.suscribir(suscriptor);
        await emisor.emitir("proyecto.listo", {});
        assert.equal(destino.llamadas.length, 1);
    });

    it("solo manda a quien le interesa el evento", async () => {
        const destino = destinoFalso();
        const emisor = crearEmisor({ enviar: destino.enviar, esperar: async () => {} });
        emisor.suscribir({ ...suscriptor, url: "http://a.test", eventos: ["proyecto.listo"] });
        emisor.suscribir({ ...suscriptor, url: "http://b.test", eventos: ["proyecto.fallido"] });
        await emisor.emitir("proyecto.listo", {});
        assert.deepEqual(destino.llamadas.map((l) => l.url), ["http://a.test"]);
    });
});

describe("todo junto con el simulador (HTTP de verdad)", () => {
    it("la granja avisa -> el proyecto cambia -> el cliente recibe el webhook firmado (con 1 fallo y reintento)", async () => {
        const emisor = crearEmisor({ baseMs: 10 });
        const app = crearApp({ secretoGranja: SECRETO, emisor });
        const server = app.listen(0);
        const base = `http://127.0.0.1:${server.address().port}`;
        try {
            await request(app).post("/api/suscripciones").send({ url: `${base}/simulador/recibir`, eventos: ["proyecto.*"], secreto: "secreto-del-cliente-1" }).expect(201);
            await request(app).post("/simulador/recibir?configurarFallos=1");

            await mandarWebhook(app, { id: "evt_a", tipo: "render.iniciado", datos: { proyectoId: "casa-lago" } });

            let recibidos = [];
            for (let i = 0; i < 100 && recibidos.length === 0; i++) {
                await esperar(10);
                recibidos = (await request(app).get("/simulador/recibidos")).body.data;
            }
            assert.equal(recibidos.length, 1);
            assert.equal(recibidos[0].tipo, "proyecto.renderizando");
            assert.equal(recibidos[0].intento, "2");
            assert.equal(recibidos[0].body.datos.estado, "renderizando");
        } finally {
            server.close();
        }
    });

    it("400 al suscribirse con datos malos y el secreto nunca se muestra", async () => {
        const app = crearApp();
        assert.equal((await request(app).post("/api/suscripciones").send({ url: "ftp://x", eventos: [], secreto: "corto" })).body.errors.length, 3);
        await request(app).post("/api/suscripciones").send({ url: "http://x.test", eventos: ["*"], secreto: "secreto-del-cliente-1" });
        assert.doesNotMatch(JSON.stringify((await request(app).get("/api/suscripciones")).body), /secreto-del-cliente/);
    });
});
