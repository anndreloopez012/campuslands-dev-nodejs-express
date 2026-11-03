import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { crearParserCsv, normalizarEncabezado } from "../src/csv/parser.js";

// parsea un texto partido en los pedazos que yo quiera
async function parsear(pedazos, opciones) {
    const filas = [];
    const stream = Readable.from(pedazos.map((p) => Buffer.from(p))).pipe(crearParserCsv(opciones));
    for await (const fila of stream) filas.push(fila);
    return filas;
}

const campos = (filas) => filas.map((f) => f.campos);

describe("crearParserCsv", () => {
    it("campos simples", async () => {
        assert.deepEqual(campos(await parsear(["a,b,c\n1,2,3\n"])), [["a", "b", "c"], ["1", "2", "3"]]);
    });

    it("comas, comillas escapadas y saltos de linea dentro de comillas", async () => {
        const filas = await parsear(['"Ma Long, CHN","dijo ""hola""","linea 1\nlinea 2",fin\n']);
        assert.deepEqual(campos(filas), [["Ma Long, CHN", 'dijo "hola"', "linea 1\nlinea 2", "fin"]]);
    });

    it("funciona aunque los chunks corten en cualquier lugar (incluso entre dos comillas)", async () => {
        const texto = 'x,"a ""b"", c"\r\n1,"dos\r\ntres"\r\n';
        // lo parto de a 1 caracter: el peor caso
        const filas = await parsear([...texto]);
        assert.deepEqual(campos(filas), [["x", 'a "b", c'], ["1", "dos\ntres"]]);
    });

    it("\\r\\n de Windows, ultima fila sin salto y filas vacias", async () => {
        assert.deepEqual(campos(await parsear(["a,b\r\n\r\n1,2"])), [["a", "b"], ["1", "2"]]);
    });

    it("quita el BOM que pone Excel", async () => {
        assert.deepEqual(campos(await parsear(["﻿fecha,torneo\n"])), [["fecha", "torneo"]]);
    });

    it("detecta ; como separador (Excel en espanol)", async () => {
        assert.deepEqual(campos(await parsear(["a;b;c\n1,5;2;3\n"])), [["a", "b", "c"], ["1,5", "2", "3"]]);
    });

    it("guarda en que linea empieza cada fila (aunque un campo tenga saltos)", async () => {
        const filas = await parsear(['a,b\n"uno\ndos",x\ny,z\n']);
        assert.deepEqual(filas.map((f) => f.linea), [1, 2, 4]);
    });

    it("campos vacios", async () => {
        assert.deepEqual(campos(await parsear(["a,,c\n,,\n"])), [["a", "", "c"], ["", "", ""]]);
    });

    it("comillas sin cerrar dan error con la linea", async () => {
        await assert.rejects(parsear(['a,b\n1,"sin cerrar\n']), { status: 400, message: /linea 2/ });
    });
});

describe("normalizarEncabezado", () => {
    it("minusculas, sin tildes y con guion bajo", () => {
        assert.equal(normalizarEncabezado(" Jugador A "), "jugador_a");
        assert.equal(normalizarEncabezado("Fécha"), "fecha");
        assert.equal(normalizarEncabezado("Sets (A)"), "sets_a");
    });
});
