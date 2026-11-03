import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { separarLineas, aCsv, aNdjson, filtrar, limitarBytes, estadisticasGolpes } from "../src/streams/transformaciones.js";

// junta todo lo que sale de un stream en un arreglo
async function juntar(stream) {
    const salida = [];
    for await (const parte of stream) salida.push(parte);
    return salida;
}

describe("separarLineas", () => {
    it("arma las lineas aunque un chunk corte una linea a la mitad", async () => {
        const pedazos = ['{"a":', '1}\n{"a"', ":2}\n", '{"a":3}'];
        const lineas = await juntar(Readable.from(pedazos.map((p) => Buffer.from(p))).pipe(separarLineas()));

        assert.deepEqual(lineas, [
            { numero: 1, linea: '{"a":1}' },
            { numero: 2, linea: '{"a":2}' },
            { numero: 3, linea: '{"a":3}' }
        ]);
    });

    it("acepta \\r\\n y salta lineas vacias sin perder la cuenta", async () => {
        const lineas = await juntar(Readable.from([Buffer.from("uno\r\n\r\ntres\n")]).pipe(separarLineas()));
        assert.deepEqual(lineas, [{ numero: 1, linea: "uno" }, { numero: 3, linea: "tres" }]);
    });
});

describe("formatos", () => {
    it("aNdjson pone un objeto por linea", async () => {
        const texto = (await juntar(Readable.from([{ a: 1 }, { a: 2 }]).pipe(aNdjson()))).join("");
        assert.equal(texto, '{"a":1}\n{"a":2}\n');
    });

    it("aCsv pone encabezado y escapa comas y comillas", async () => {
        const datos = [{ id: 1, nombre: 'Badr "Golden Boy" Hari' }, { id: 2, nombre: "Souwer, Andy" }];
        const texto = (await juntar(Readable.from(datos).pipe(aCsv(["id", "nombre"])))).join("");
        assert.equal(texto, 'id,nombre\n1,"Badr ""Golden Boy"" Hari"\n2,"Souwer, Andy"\n');
    });

    it("filtrar deja pasar solo los que cumplen", async () => {
        const pares = await juntar(Readable.from([1, 2, 3, 4]).pipe(filtrar((n) => n % 2 === 0)));
        assert.deepEqual(pares, [2, 4]);
    });
});

describe("limitarBytes", () => {
    it("deja pasar hasta el limite y despues corta con 413", async () => {
        const chico = await juntar(Readable.from([Buffer.from("12345")]).pipe(limitarBytes(5)));
        assert.equal(Buffer.concat(chico).toString(), "12345");

        await assert.rejects(pipeline(Readable.from([Buffer.from("123"), Buffer.from("456")]), limitarBytes(5), estadisticasGolpes()), { status: 413 });
    });
});

describe("estadisticasGolpes", () => {
    it("calcula sin guardar todos los golpes y reporta las lineas malas", async () => {
        const texto = ['{"tipo":"jab","potencia":300}', "esto no es json", '{"tipo":"hook","potencia":900}', '{"tipo":"cabezazo","potencia":10}', '{"tipo":"jab","potencia":100}'].join("\n");
        const estadisticas = estadisticasGolpes();

        await pipeline(Readable.from([Buffer.from(texto)]), separarLineas(), estadisticas);

        assert.deepEqual(estadisticas.resultado(), {
            validos: 3,
            invalidos: 2,
            primerosInvalidos: [
                { linea: 2, motivo: "JSON invalido" },
                { linea: 4, motivo: "tipo o potencia invalidos" }
            ],
            potenciaPromedio: 433,
            potenciaMax: 900,
            porTipo: { jab: 2, hook: 1 }
        });
    });
});
