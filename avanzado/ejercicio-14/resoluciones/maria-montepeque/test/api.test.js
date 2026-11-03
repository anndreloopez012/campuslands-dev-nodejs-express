import { describe, it, afterEach } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

let app;
afterEach(() => app?.locals.detener());

// busca una linea de /metrics
const linea = (texto, inicio) => texto.split("\n").find((l) => l.startsWith(inicio));
const esperar = () => new Promise((r) => setTimeout(r, 10));

describe("metricas HTTP", () => {
    it("cuenta por patron de ruta, no por URL real (sin explosion de series)", async () => {
        app = crearApp();
        for (const id of [1, 2, 3, 4, 5]) await request(app).get(`/api/libros/${id}`);
        await esperar();

        const texto = (await request(app).get("/metrics")).text;
        assert.equal(linea(texto, 'http_requests_total{metodo="GET",ruta="/api/libros/:id",status="200"}'), 'http_requests_total{metodo="GET",ruta="/api/libros/:id",status="200"} 5');
        assert.doesNotMatch(texto, /ruta="\/api\/libros\/3"/);
    });

    it("separa por status y agrupa las rutas que no existen", async () => {
        app = crearApp();
        await request(app).get("/api/libros/99");
        await request(app).get("/no/existe/1");
        await request(app).get("/no/existe/2");
        await esperar();

        const texto = (await request(app).get("/metrics")).text;
        assert.match(texto, /http_requests_total\{metodo="GET",ruta="\/api\/libros\/:id",status="404"\} 1/);
        assert.match(texto, /http_requests_total\{metodo="GET",ruta="no_encontrada",status="404"\} 2/);
    });

    it("el histograma de duracion tiene baldes, _sum y _count", async () => {
        app = crearApp();
        await request(app).get("/api/libros");
        await esperar();

        const texto = (await request(app).get("/metrics")).text;
        assert.match(texto, /# TYPE http_request_duration_seconds histogram/);
        assert.match(texto, /http_request_duration_seconds_bucket\{metodo="GET",ruta="\/api\/libros",le="\+Inf"\} 1/);
        assert.match(texto, /http_request_duration_seconds_count\{metodo="GET",ruta="\/api\/libros"\} 1/);
    });

    it("el JSON muestra p50 y p95: unas pocas lentas suben el p95 pero no el p50", async () => {
        app = crearApp();
        for (let i = 0; i < 18; i++) await request(app).get("/api/lento?ms=0");
        for (let i = 0; i < 2; i++) await request(app).get("/api/lento?ms=120");
        await esperar();

        const dur = (await request(app).get("/api/metricas")).body.data.http_request_duration_seconds.find((s) => s.etiquetas.ruta === "/api/lento");
        assert.equal(dur.total, 20);
        assert.ok(dur.p50 < 0.05, `p50 ${dur.p50}`);
        assert.ok(dur.p95 >= 0.1, `p95 ${dur.p95}`);
    });
});

describe("metricas del negocio", () => {
    it("prestamos por genero, activos, disponibles y rechazos", async () => {
        app = crearApp();
        await request(app).post("/api/libros/3/prestar");
        await request(app).post("/api/libros/1/prestar");
        await request(app).post("/api/libros/1/prestar");
        await request(app).post("/api/libros/1/devolver");
        await request(app).post("/api/libros/3/prestar"); // Ficciones solo tiene 1 copia
        await request(app).post("/api/libros/5/devolver"); // nunca se presto

        const m = (await request(app).get("/api/metricas")).body.data;
        const valor = (nombre, etqs = {}) => m[nombre].find((s) => JSON.stringify(s.etiquetas) === JSON.stringify(etqs))?.valor;

        assert.equal(valor("biblioteca_prestamos_total", { genero: "novela" }), 2);
        assert.equal(valor("biblioteca_prestamos_total", { genero: "cuento" }), 1);
        assert.equal(valor("biblioteca_devoluciones_total", { genero: "novela" }), 1);
        assert.equal(valor("biblioteca_prestamos_activos"), 2);
        assert.equal(valor("biblioteca_rechazos_total", { motivo: "sin_copias" }), 1);
        assert.equal(valor("biblioteca_rechazos_total", { motivo: "no_prestado" }), 1);
        assert.equal(valor("biblioteca_disponibles", { genero: "cuento" }), 0);
        assert.equal(valor("biblioteca_disponibles", { genero: "novela" }), 6);
    });

    it("metricas del proceso", async () => {
        app = crearApp();
        const texto = (await request(app).get("/metrics")).text;
        assert.match(texto, /process_resident_memory_bytes \d+/);
        assert.match(texto, /process_uptime_seconds \d+/);
        assert.match(texto, /nodejs_eventloop_lag_p99_seconds [\d.e-]+/);
    });
});

describe("proteger /metrics", () => {
    it("con METRICS_TOKEN pide el token", async () => {
        app = crearApp({ tokenMetricas: "secreto" });
        assert.equal((await request(app).get("/metrics")).status, 401);
        assert.equal((await request(app).get("/metrics").set("Authorization", "Bearer secreto")).status, 200);
        assert.match((await request(app).get("/metrics").set("Authorization", "Bearer secreto")).headers["content-type"], /text\/plain/);
    });
});
