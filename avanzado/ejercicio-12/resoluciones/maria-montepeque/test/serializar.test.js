import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { aJson, proyectar, streamJson } from "../src/exportar/serializar.js";

describe("aJson (replacer seguro)", () => {
    it("JSON.stringify normal pierde los Set y falla con BigInt", () => {
        assert.equal(JSON.stringify({ s: new Set([1, 2]) }), '{"s":{}}');
        assert.throws(() => JSON.stringify({ n: 10n }), /BigInt/);
    });

    it("con el replacer: Set -> arreglo, Map -> objeto, BigInt -> texto, Date -> ISO", () => {
        const texto = aJson({
            s: new Set(["miedo", "folk"]),
            m: new Map([["a", 1]]),
            n: 12345678901234567890n,
            d: new Date(Date.UTC(2019, 6, 3))
        });
        assert.deepEqual(JSON.parse(texto), { s: ["miedo", "folk"], m: { a: 1 }, n: "12345678901234567890", d: "2019-07-03T00:00:00.000Z" });
    });
});

describe("proyectar", () => {
    it("deja solo los campos de la lista", () => {
        assert.deepEqual(proyectar({ id: 1, titulo: "It", secreto: "x" }, ["id", "titulo"]), { id: 1, titulo: "It" });
    });
});

describe("streamJson", () => {
    async function texto(stream) {
        let salida = "";
        for await (const parte of stream) salida += parte;
        return salida;
    }

    it("arma un JSON valido con meta, lista y total al final", async () => {
        const json = JSON.parse(await texto(streamJson({ meta: { v: 1 }, nombreLista: "items", items: [{ a: 1 }, { a: 2 }], transformar: (x) => x })));
        assert.deepEqual(json, { meta: { v: 1 }, items: [{ a: 1 }, { a: 2 }], total: 2 });
    });

    it("sin items tambien es valido", async () => {
        const json = JSON.parse(await texto(streamJson({ meta: {}, nombreLista: "items", items: [], transformar: (x) => x })));
        assert.deepEqual(json, { meta: {}, items: [], total: 0 });
    });

    it("sale en muchos pedazos, no en uno gigante", async () => {
        const items = Array.from({ length: 3000 }, (_, i) => ({ i }));
        let pedazos = 0;
        for await (const _ of streamJson({ meta: {}, nombreLista: "x", items, transformar: (x) => x })) pedazos++;
        assert.ok(pedazos > 3000);
    });
});
