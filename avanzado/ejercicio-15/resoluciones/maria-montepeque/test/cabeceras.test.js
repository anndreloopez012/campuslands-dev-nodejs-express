import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";
import { escaparHtml } from "../src/vistas/menu.js";

const app = crearApp();

// los headers que tienen que estar en TODAS las respuestas
const BASE = {
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer",
    "permissions-policy": "camera=(), microphone=(), geolocation=(), payment=()",
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-resource-policy": "same-origin",
    "x-dns-prefetch-control": "off"
};

describe("headers en todas las respuestas", () => {
    for (const [nombre, peticion] of [
        ["200 JSON", () => request(app).get("/api/menu")],
        ["201", () => request(app).post("/api/pedidos").send({ platoId: 1, cliente: "Ana", telefono: "55551234" })],
        ["400", () => request(app).post("/api/pedidos").send({})],
        ["404", () => request(app).get("/no-existe")],
        ["JSON roto", () => request(app).post("/api/pedidos").set("Content-Type", "application/json").send("{mal")],
        ["pagina HTML", () => request(app).get("/menu")]
    ]) {
        it(`${nombre}: lleva los headers de seguridad y no X-Powered-By`, async () => {
            const res = await peticion();
            for (const [header, valor] of Object.entries(BASE)) {
                assert.equal(res.headers[header], valor, `falta o esta mal ${header}`);
            }
            assert.equal(res.headers["x-powered-by"], undefined);
            assert.ok(res.headers["content-security-policy"]);
        });
    }

    it("la API tiene una CSP que no permite nada", async () => {
        const res = await request(app).get("/api/menu");
        assert.equal(res.headers["content-security-policy"], "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    });
});

describe("cache", () => {
    it("el menu se puede guardar 5 minutos", async () => {
        assert.equal((await request(app).get("/api/menu")).headers["cache-control"], "public, max-age=300");
    });

    it("los pedidos (datos personales) nunca se guardan", async () => {
        const creado = await request(app).post("/api/pedidos").send({ platoId: 2, cliente: "Luis", telefono: "44443333" });
        assert.equal(creado.headers["cache-control"], "no-store");
        assert.equal((await request(app).get(`/api/pedidos/${creado.body.data.id}`)).headers["cache-control"], "no-store");
    });
});

describe("HSTS", () => {
    it("no se manda por HTTP ni fuera de produccion", async () => {
        assert.equal((await request(app).get("/health")).headers["strict-transport-security"], undefined);
        assert.equal((await request(crearApp({ produccion: true })).get("/health")).headers["strict-transport-security"], undefined);
    });

    it("en produccion detras de un proxy HTTPS si se manda", async () => {
        const prod = crearApp({ produccion: true, confiarProxy: true });
        const res = await request(prod).get("/health").set("X-Forwarded-Proto", "https");
        assert.equal(res.headers["strict-transport-security"], "max-age=15552000; includeSubDomains");
    });

    it("sin trust proxy no se confia en X-Forwarded-Proto (cualquiera lo puede mandar)", async () => {
        const res = await request(crearApp({ produccion: true })).get("/health").set("X-Forwarded-Proto", "https");
        assert.equal(res.headers["strict-transport-security"], undefined);
    });
});

describe("pagina HTML con CSP y nonce", () => {
    it("el script tiene el mismo nonce que la CSP", async () => {
        const res = await request(app).get("/menu");
        const nonce = res.headers["content-security-policy"].match(/script-src 'nonce-([^']+)'/)[1];

        assert.match(res.text, new RegExp(`<script nonce="${nonce.replace(/[+/=]/g, "\\$&")}">`));
        assert.match(res.headers["content-security-policy"], /frame-ancestors 'none'/);
    });

    it("cada respuesta tiene un nonce distinto", async () => {
        const a = (await request(app).get("/menu")).headers["content-security-policy"];
        const b = (await request(app).get("/menu")).headers["content-security-policy"];
        assert.notEqual(a, b);
    });

    it("el nombre con <script> sale escapado, como texto", async () => {
        const res = await request(app).get("/menu");
        assert.match(res.text, /&lt;script&gt;alert\(&quot;hackeado&quot;\)&lt;\/script&gt;Pupusas/);
        assert.doesNotMatch(res.text, /<script>alert/);
        assert.match(res.text, /Pupuseria &lt;b&gt;Ana&lt;\/b&gt;/);
    });
});

describe("escaparHtml", () => {
    it("escapa los 5 caracteres peligrosos", () => {
        assert.equal(escaparHtml(`<a href="x" onclick='y'>&</a>`), "&lt;a href=&quot;x&quot; onclick=&#39;y&#39;&gt;&amp;&lt;/a&gt;");
    });
});

describe("limite del body", () => {
    it("un body de mas de 10kb da 413 (y tambien lleva los headers)", async () => {
        const res = await request(app).post("/api/pedidos").send({ cliente: "x".repeat(20_000) });
        assert.equal(res.status, 413);
        assert.equal(res.headers["x-content-type-options"], "nosniff");
    });
});
