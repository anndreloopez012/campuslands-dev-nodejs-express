import { describe, it } from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import { crearApp } from "../src/app.js";

const app = crearApp();
const revisar = (csv) => request(app).post("/api/partidos/revisar").set("Content-Type", "text/csv").send(csv);

describe("leer el archivo data/partidos.csv", () => {
    it("ranking por victorias y diferencia de sets", async () => {
        const res = await request(app).get("/api/ranking");

        assert.equal(res.status, 200);
        assert.equal(res.body.partidosLeidos, 8);
        // los 4 ganaron 2: desempata la diferencia de sets (calculada a mano)
        assert.deepEqual(
            res.body.data.map((f) => [f.jugador, f.ganados, f.diferenciaSets]),
            [
                ["Truls Moregard", 2, 3],
                ["Ma Long", 2, 2],
                ["Hugo Calderano", 2, -2],
                ["Fan Zhendong", 2, -3]
            ]
        );
    });

    it("el torneo con coma y con comillas se lee entero", async () => {
        const res = await request(app).get("/api/partidos?jugador=hugo calderano");
        const torneos = [...new Set(res.body.data.map((p) => p.torneo))];
        assert.deepEqual(torneos, ["Copa Centroamericana, Guatemala", 'Open "Los Volcanes"']);
    });

    it("si el archivo no existe da un error claro", async () => {
        const res = await request(crearApp({ archivo: "no-existe.csv" })).get("/api/ranking");
        assert.equal(res.status, 500);
        assert.equal(res.body.message, "No se encontro el archivo de partidos");
    });
});

describe("POST /api/partidos/revisar", () => {
    it("CSV con ; y encabezados con tildes y mayusculas", async () => {
        const res = await revisar("Fécha;TORNEO;Jugador A;Jugador B;Sets A;Sets B\n2026-05-01;Liga;Ana;Bea;3;2\n");

        assert.equal(res.status, 200);
        assert.equal(res.body.data.validos, 1);
        assert.deepEqual(res.body.data.vistaPrevia[0], { fecha: "2026-05-01", torneo: "Liga", jugadorA: "Ana", jugadorB: "Bea", setsA: 3, setsB: 2, ganador: "Ana" });
    });

    it("cada fila mala dice su linea y que tiene", async () => {
        const csv = [
            "fecha,torneo,jugador_a,jugador_b,sets_a,sets_b",
            "2026-05-01,Liga,Ana,Bea,3,1",
            "01/05/2026,Liga,Ana,Bea,3,1",
            "2026-05-02,Liga,Ana,ana,3,0",
            "2026-05-03,Liga,Ana,Bea,3,3",
            "2026-05-04,Liga,Ana,Bea,tres,1",
            "2026-05-05,Liga,Ana"
        ].join("\n");

        const { data } = (await revisar(csv)).body;
        assert.equal(data.filas, 6);
        assert.equal(data.validos, 1);
        assert.deepEqual(data.errores, [
            { linea: 3, errores: ['fecha "01/05/2026" no es AAAA-MM-DD'] },
            { linea: 4, errores: ["un jugador no puede jugar contra si mismo"] },
            { linea: 5, errores: ["el marcador 3-3 no es valido al mejor de 5"] },
            { linea: 6, errores: ["sets_a y sets_b deben ser numeros enteros"] },
            { linea: 7, errores: ["tiene 3 columnas y deberia tener 6", "faltan jugadores", "sets_a y sets_b deben ser numeros enteros"] }
        ]);
    });

    it("con muchas filas malas devuelve solo 50 errores y avisa", async () => {
        const filas = Array.from({ length: 80 }, () => "mal,Liga,A,B,9,9");
        const { data } = (await revisar(["fecha,torneo,jugador_a,jugador_b,sets_a,sets_b", ...filas].join("\n"))).body;

        assert.equal(data.invalidos, 80);
        assert.equal(data.errores.length, 50);
        assert.equal(data.erroresTruncados, true);
    });

    it("400 si faltan columnas, mostrando lo que leyo", async () => {
        const res = await revisar("fecha,torneo,jugador\n2026-01-01,Liga,Ana\n");
        assert.equal(res.status, 400);
        assert.equal(res.body.message, "Al CSV le faltan columnas: jugador_a, jugador_b, sets_a, sets_b");
        assert.deepEqual(res.body.encabezadoLeido, ["fecha", "torneo", "jugador"]);
    });

    it("400 con comillas sin cerrar y 415 si no es CSV", async () => {
        assert.equal((await revisar('fecha,torneo\n"roto,x\n')).status, 400);
        assert.equal((await request(app).post("/api/partidos/revisar").send({ a: 1 })).status, 415);
    });
});
