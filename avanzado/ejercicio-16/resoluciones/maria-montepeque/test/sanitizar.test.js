import { describe, it } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { limpiarTexto, quitarHtml, numeroEstricto } from "../src/sanitizar/texto.js";
import { buscarLlavesPeligrosas, mergeSeguro, elegir } from "../src/sanitizar/objetos.js";
import { textoDeQuery, escaparRegex, rutaDentroDe } from "../src/sanitizar/entrada.js";

describe("prototype pollution", () => {
    // un merge "normal" de los que se ven en internet
    function mergeIngenuo(destino, origen) {
        for (const clave in origen) {
            if (typeof origen[clave] === "object" && origen[clave] !== null) {
                destino[clave] = mergeIngenuo(destino[clave] || {}, origen[clave]);
            } else {
                destino[clave] = origen[clave];
            }
        }
        return destino;
    }

    it("EL PROBLEMA: con un merge ingenuo, el body contamina TODOS los objetos", () => {
        const ataque = JSON.parse('{"__proto__":{"esAdmin":true}}');
        mergeIngenuo({}, ataque);

        assert.equal({}.esAdmin, true);
        // limpio para no afectar los otros tests
        delete Object.prototype.esAdmin;
    });

    it("mergeSeguro ignora __proto__, constructor y prototype", () => {
        const ataque = JSON.parse('{"__proto__":{"esAdmin":true},"constructor":{"prototype":{"x":1}},"preferencias":{"tallas":[42]}}');
        const resultado = mergeSeguro({ preferencias: { colores: ["rojo"] } }, ataque);

        assert.equal({}.esAdmin, undefined);
        assert.equal({}.x, undefined);
        assert.deepEqual(resultado, { preferencias: { colores: ["rojo"], tallas: [42] } });
    });

    it("buscarLlavesPeligrosas encuentra hasta las anidadas", () => {
        const body = JSON.parse('{"a":{"b":[{"__proto__":{}}]},"constructor":1}');
        assert.deepEqual(buscarLlavesPeligrosas(body), ["body.a.b.0.__proto__", "body.constructor"]);
    });
});

describe("limpiarTexto", () => {
    it("quita caracteres de control e invisibles y junta espacios", () => {
        assert.equal(limpiarTexto("  ad\u200Bmin\u0000  \t con   espacios  "), "admin con espacios");
    });

    it("normaliza tildes: la misma palabra escrita de dos formas queda igual", () => {
        const compuesta = "Jose\u0301";
        assert.notEqual(compuesta, "José");
        assert.equal(limpiarTexto(compuesta), "José");
    });

    it("corta por caracteres reales sin romper emojis", () => {
        assert.equal(limpiarTexto("👟👟👟", { max: 2 }), "👟👟");
    });

    it("si no es texto devuelve null (un objeto no se convierte en '[object Object]')", () => {
        assert.equal(limpiarTexto({ $gt: "" }), null);
        assert.equal(limpiarTexto(["a"]), null);
    });
});

describe("quitarHtml", () => {
    it("quita scripts con su contenido, etiquetas y < sueltos", () => {
        assert.equal(quitarHtml('Buenos <b>tenis</b><script>robar()</script> <img src=x onerror=alert(1)>'), "Buenos tenis");
        assert.equal(quitarHtml("5 < 7 y <SCRIPT >x</SCRIPT >listo"), "5  7 y listo");
    });
});

describe("numeroEstricto", () => {
    for (const malo of ["1e309", "", " 12 ", "0x10", "12abc", NaN, Infinity, null, [], {}, true]) {
        it(`rechaza ${JSON.stringify(malo) ?? String(malo)}`, () => {
            assert.equal(numeroEstricto(malo), null);
        });
    }

    it("acepta numeros y texto numerico, con rango y entero", () => {
        assert.equal(numeroEstricto("4", { entero: true, min: 1, max: 5 }), 4);
        assert.equal(numeroEstricto(4.5, { entero: true }), null);
        assert.equal(numeroEstricto(-0), 0);
        assert.ok(Object.is(numeroEstricto(-0), 0));
    });
});

describe("query, regex y archivos", () => {
    it("textoDeQuery rechaza arreglos y objetos", () => {
        assert.equal(textoDeQuery("nike"), "nike");
        assert.equal(textoDeQuery(["nike", "adidas"]), null);
        assert.equal(textoDeQuery({ $ne: "x" }), null);
    });

    it("escaparRegex: un patron malicioso termina rapido y como texto literal", () => {
        const patron = new RegExp(escaparRegex("(a+)+$"));
        const inicio = Date.now();
        assert.equal(patron.test("a".repeat(30) + "!"), false);
        assert.ok(Date.now() - inicio < 50);
        assert.equal(new RegExp(escaparRegex(".*")).test("cualquier cosa"), false);
    });

    it("rutaDentroDe no deja salir de la carpeta", () => {
        const carpeta = path.resolve("data/imagenes");
        assert.equal(rutaDentroDe(carpeta, "air-max-90.txt"), path.join(carpeta, "air-max-90.txt"));
        for (const malo of ["../secreto.txt", "..%2Fsecreto.txt", "..\\secreto.txt", "/etc/passwd", "C:\\Windows\\win.ini", ".env", "a/b.txt", "x".repeat(200) + ".txt"]) {
            assert.equal(rutaDentroDe(carpeta, malo), null, malo);
        }
    });
});

describe("elegir (mass assignment)", () => {
    it("solo copia los campos permitidos y no los heredados", () => {
        const body = Object.assign(Object.create({ heredado: 1 }), { nombre: "Ana", rol: "admin", saldo: 9999 });
        assert.deepEqual(elegir(body, ["nombre", "heredado"]), { nombre: "Ana" });
    });
});
