import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { Partida, CAPACIDAD_INVENTARIO } from "../src/dominio/partida.js";
import { ErrorDeDominio, ReglaDelJuego, EstadoInvalido, NoEncontrado, Conflicto, CATALOGO, error } from "../src/dominio/errores.js";

// el dominio se prueba sin express: solo clases y errores

const ITEMS = [
    { id: 1, tipo: "arma", nombre: "Rifle", dano: 35 },
    { id: 2, tipo: "arma", nombre: "Escopeta", dano: 60 },
    { id: 3, tipo: "municion", nombre: "Balas", cantidad: 3 },
    { id: 5, tipo: "botiquin", nombre: "Botiquin", cura: 40 },
    { id: 7, tipo: "escudo", nombre: "Escudo", puntos: 25 },
    { id: 9, tipo: "botiquin", nombre: "Venda", cura: 15 },
    { id: 10, tipo: "botiquin", nombre: "Venda", cura: 15 }
];

let p;
beforeEach(() => {
    p = new Partida({ id: 1, mapa: "Test", jugadores: ["Raven", "Wolf", "Ghost"], items: ITEMS });
});

// atajo: revisa clase y code del error
function lanza(fn, Familia, code) {
    assert.throws(fn, (e) => e instanceof Familia && e instanceof ErrorDeDominio && e.code === code);
}

describe("errores del dominio", () => {
    it("tienen familia, code, mensaje y detalles", () => {
        const e = error("INVENTARIO_LLENO", "lleno", { capacidad: 5 });

        assert.ok(e instanceof ReglaDelJuego);
        assert.ok(e instanceof Error);
        assert.equal(e.name, "ReglaDelJuego");
        assert.equal(e.code, "INVENTARIO_LLENO");
        assert.deepEqual(e.detalles, { capacidad: 5 });
    });

    it("usar un code que no esta en el catalogo es un bug y avisa", () => {
        assert.throws(() => error("INVENTADO", "x"), /no esta en el catalogo/);
    });

    it("todos los codes del catalogo estan en MAYUSCULAS_CON_GUION_BAJO", () => {
        for (const code of Object.keys(CATALOGO)) {
            assert.match(code, /^[A-Z]+(_[A-Z]+)*$/);
        }
    });

    it("el dominio no importa nada de http ni de express", () => {
        const carpeta = new URL("../src/dominio/", import.meta.url);
        for (const archivo of readdirSync(carpeta)) {
            const texto = readFileSync(new URL(archivo, carpeta), "utf8");
            assert.doesNotMatch(texto, /from "express"|\/http\/|statusCode|res\.status/, `${archivo} sabe de http`);
        }
    });
});

describe("Partida: recoger", () => {
    it("guarda el item en el inventario y lo saca del suelo", () => {
        p.recoger("raven", 1);
        assert.deepEqual(p.jugador("Raven").inventario.map((i) => i.id), [1]);
        assert.equal(p.items.has(1), false);
    });

    it("la municion no ocupa espacio", () => {
        p.recoger("Raven", 3);
        assert.equal(p.jugador("Raven").municion, 3);
        assert.equal(p.jugador("Raven").inventario.length, 0);
    });

    it("ITEM_YA_RECOGIDO con quien lo tiene", () => {
        p.recoger("Raven", 1);
        assert.throws(() => p.recoger("Wolf", 1), (e) => e instanceof Conflicto && e.detalles.recogidoPor === "Raven");
    });

    it("INVENTARIO_LLENO con capacidad y ocupados", () => {
        [1, 2, 5, 7, 9].forEach((id) => p.recoger("Raven", id));
        assert.throws(
            () => p.recoger("Raven", 10),
            (e) => e.code === "INVENTARIO_LLENO" && e.detalles.capacidad === CAPACIDAD_INVENTARIO && e.detalles.ocupados === 5
        );
        // el item sigue en el suelo para otro
        assert.equal(p.items.has(10), true);
    });

    it("ITEM_NO_ENCONTRADO y JUGADOR_NO_ENCONTRADO", () => {
        lanza(() => p.recoger("Raven", 99), NoEncontrado, "ITEM_NO_ENCONTRADO");
        lanza(() => p.recoger("Nadie", 1), NoEncontrado, "JUGADOR_NO_ENCONTRADO");
    });

    it("PARTIDA_NO_EN_CURSO si esta en lobby", () => {
        const lobby = new Partida({ id: 2, mapa: "x", estado: "lobby", jugadores: ["A"], items: ITEMS });
        lanza(() => lobby.recoger("A", 1), EstadoInvalido, "PARTIDA_NO_EN_CURSO");
    });
});

describe("Partida: usar", () => {
    it("el botiquin cura hasta 100 y se gasta", () => {
        p.jugador("Raven").vida = 80;
        p.recoger("Raven", 5);
        p.usar("Raven", 5);
        assert.equal(p.jugador("Raven").vida, 100);
        assert.equal(p.jugador("Raven").inventario.length, 0);
    });

    it("VIDA_COMPLETA y el botiquin no se gasta", () => {
        p.recoger("Raven", 5);
        lanza(() => p.usar("Raven", 5), ReglaDelJuego, "VIDA_COMPLETA");
        assert.equal(p.jugador("Raven").inventario.length, 1);
    });

    it("ITEM_NO_EN_INVENTARIO e ITEM_NO_USABLE", () => {
        lanza(() => p.usar("Raven", 5), ReglaDelJuego, "ITEM_NO_EN_INVENTARIO");
        p.recoger("Raven", 1);
        lanza(() => p.usar("Raven", 1), ReglaDelJuego, "ITEM_NO_USABLE");
    });
});

describe("Partida: disparar", () => {
    beforeEach(() => {
        p.recoger("Raven", 2); // escopeta 60
        p.recoger("Raven", 3); // 3 balas
    });

    it("el dano baja primero el escudo", () => {
        p.recoger("Wolf", 7);
        p.usar("Wolf", 7); // escudo 25
        const { victima } = p.disparar("Raven", { objetivo: "Wolf", armaId: 2 });

        assert.equal(victima.escudo, 0);
        assert.equal(victima.vida, 65);
    });

    it("elimina, suma la baja y gana el ultimo vivo", () => {
        p.disparar("Raven", { objetivo: "Wolf", armaId: 2 });
        p.disparar("Raven", { objetivo: "Wolf", armaId: 2 });
        assert.equal(p.jugador("Wolf").vivo, false);
        assert.equal(p.jugador("Raven").bajas, 1);

        p.jugador("Raven").municion = 2;
        p.disparar("Raven", { objetivo: "Ghost", armaId: 2 });
        p.disparar("Raven", { objetivo: "Ghost", armaId: 2 });

        assert.equal(p.estado, "terminada");
        assert.equal(p.ganador, "Raven");
        lanza(() => p.disparar("Raven", { objetivo: "Ghost", armaId: 2 }), EstadoInvalido, "PARTIDA_NO_EN_CURSO");
    });

    it("JUGADOR_ELIMINADO: ni puede actuar ni lo pueden atacar", () => {
        p.disparar("Raven", { objetivo: "Wolf", armaId: 2 });
        p.disparar("Raven", { objetivo: "Wolf", armaId: 2 });

        lanza(() => p.disparar("Raven", { objetivo: "Wolf", armaId: 2 }), EstadoInvalido, "JUGADOR_ELIMINADO");
        lanza(() => p.recoger("Wolf", 1), EstadoInvalido, "JUGADOR_ELIMINADO");
    });

    it("SIN_MUNICION, ARMA_NO_EQUIPADA y AUTO_DISPARO", () => {
        p.jugador("Raven").municion = 0;
        lanza(() => p.disparar("Raven", { objetivo: "Wolf", armaId: 2 }), ReglaDelJuego, "SIN_MUNICION");
        lanza(() => p.disparar("Raven", { objetivo: "Wolf", armaId: 1 }), ReglaDelJuego, "ARMA_NO_EQUIPADA");
        lanza(() => p.disparar("Raven", { objetivo: "raven", armaId: 2 }), ReglaDelJuego, "AUTO_DISPARO");
    });

    it("si falla no gasta municion ni hace dano", () => {
        lanza(() => p.disparar("Raven", { objetivo: "Wolf", armaId: 1 }), ReglaDelJuego, "ARMA_NO_EQUIPADA");
        assert.equal(p.jugador("Raven").municion, 3);
        assert.equal(p.jugador("Wolf").vida, 100);
    });
});
