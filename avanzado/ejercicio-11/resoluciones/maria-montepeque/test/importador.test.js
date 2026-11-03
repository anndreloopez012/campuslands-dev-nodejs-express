import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { importar, validarCancion } from "../src/servicios/importador.js";
import { crearCatalogo, CANCIONES_INICIALES } from "../src/datos/catalogo.js";

// arma un ISRC valido distinto para cada numero
const isrc = (i) => `GTXYZ26${String(i).padStart(5, "0")}`;
const cancion = (i, extra = {}) => ({ isrc: isrc(i), titulo: `Cancion ${i}`, artista: "Banda Prueba", genero: "marimba", anio: 2024, duracionSeg: 180, ...extra });
const ndjson = (objetos) => Readable.from([Buffer.from(objetos.map((o) => (typeof o === "string" ? o : JSON.stringify(o))).join("\n"))]);

describe("validarCancion", () => {
    it("acepta y limpia el isrc (mayusculas y sin guiones)", () => {
        const { cancion: c } = validarCancion({ ...cancion(1), isrc: "gt-xyz-26-00001", titulo: "  Hola  " });
        assert.equal(c.isrc, "GTXYZ2600001");
        assert.equal(c.titulo, "Hola");
    });

    it("junta todos los errores", () => {
        const { errores } = validarCancion({ isrc: "123", genero: "opera", anio: 1800, duracionSeg: 5 });
        assert.equal(errores.length, 6);
    });
});

describe("importar", () => {
    it("10,000 canciones en lotes de 500", async () => {
        const catalogo = crearCatalogo();
        const avances = [];
        const reporte = await importar(ndjson(Array.from({ length: 10_000 }, (_, i) => cancion(i))), catalogo, { tamanoLote: 500, alAvanzar: (p) => avances.push(p.insertadas) });

        assert.equal(reporte.insertadas, 10_000);
        assert.equal(reporte.lotes, 20);
        assert.equal(catalogo.lotesAplicados(), 20);
        assert.equal(catalogo.total(), 10_000);
        assert.equal(reporte.aplicado, true);
        // el progreso va subiendo de 500 en 500
        assert.deepEqual(avances.slice(0, 3), [500, 1000, 1500]);
    });

    it("las lineas malas no frenan la importacion y se reportan con su numero", async () => {
        const catalogo = crearCatalogo();
        const reporte = await importar(ndjson([cancion(1), "{no es json", cancion(2, { genero: "opera" }), cancion(3), cancion(1)]), catalogo);

        assert.equal(reporte.insertadas, 2);
        assert.equal(reporte.invalidas, 3);
        assert.deepEqual(reporte.errores.map((e) => e.linea), [2, 3, 5]);
        assert.match(reporte.errores[2].errores[0], /repetido en el archivo/);
    });

    it("modo insertar: lo que ya existe es duplicado; upsert lo actualiza; saltar lo ignora", async () => {
        const existente = { ...CANCIONES_INICIALES[0], titulo: "Despacito (Remix)" };

        const insertar = crearCatalogo(CANCIONES_INICIALES);
        const r1 = await importar(ndjson([existente, cancion(1)]), insertar, { modo: "insertar" });
        assert.deepEqual([r1.insertadas, r1.duplicadas], [1, 1]);
        assert.equal(insertar.buscar(existente.isrc).titulo, "Despacito");

        const upsert = crearCatalogo(CANCIONES_INICIALES);
        const r2 = await importar(ndjson([existente, cancion(1)]), upsert, { modo: "upsert" });
        assert.deepEqual([r2.insertadas, r2.actualizadas], [1, 1]);
        assert.equal(upsert.buscar(existente.isrc).titulo, "Despacito (Remix)");

        const saltar = crearCatalogo(CANCIONES_INICIALES);
        const r3 = await importar(ndjson([existente, cancion(1)]), saltar, { modo: "saltar" });
        assert.deepEqual([r3.insertadas, r3.saltadas, r3.errores.length], [1, 1, 0]);
    });

    it("todoONada: con una sola linea mala no se guarda nada (aunque ya hubiera lotes listos)", async () => {
        const catalogo = crearCatalogo();
        const filas = Array.from({ length: 1200 }, (_, i) => cancion(i));
        filas.push({ titulo: "sin isrc" });

        const reporte = await importar(ndjson(filas), catalogo, { todoONada: true, tamanoLote: 500 });

        assert.equal(reporte.aplicado, false);
        assert.equal(reporte.insertadas, 1200);
        assert.equal(catalogo.total(), 0);
        assert.equal(catalogo.lotesAplicados(), 0);
    });

    it("todoONada sin errores si guarda todo", async () => {
        const catalogo = crearCatalogo();
        const reporte = await importar(ndjson([cancion(1), cancion(2)]), catalogo, { todoONada: true });
        assert.equal(reporte.aplicado, true);
        assert.equal(catalogo.total(), 2);
    });

    it("simular da el mismo reporte pero no guarda", async () => {
        const catalogo = crearCatalogo();
        const reporte = await importar(ndjson([cancion(1), cancion(2)]), catalogo, { simular: true });
        assert.equal(reporte.insertadas, 2);
        assert.equal(reporte.aplicado, false);
        assert.equal(catalogo.total(), 0);
    });

    it("maximo 100 errores en el reporte", async () => {
        const reporte = await importar(ndjson(Array.from({ length: 150 }, () => "{mal")), crearCatalogo());
        assert.equal(reporte.invalidas, 150);
        assert.equal(reporte.errores.length, 100);
        assert.equal(reporte.erroresTruncados, true);
    });
});
