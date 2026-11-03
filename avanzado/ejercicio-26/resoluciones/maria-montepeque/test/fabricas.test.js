import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { crearAlmacen } from "../src/datos/almacen.js";
import { aleatorioConSemilla, crearFabricas } from "../src/fabricas/index.js";
import { MAPAS, marcadorValido, ROLES } from "../src/servicios/torneo.js";

let almacen;
let f;

beforeEach(() => {
    almacen = crearAlmacen();
    f = crearFabricas(almacen);
});

describe("factories", () => {
    it("build arma un equipo valido SIN guardarlo; create lo guarda", () => {
        const armado = f.equipo.build();
        assert.equal(armado.id, undefined);
        assert.equal(almacen.contar("equipos"), 0);

        const guardado = f.equipo.create();
        assert.equal(guardado.id, 1);
        assert.equal(almacen.contar("equipos"), 1);
        assert.equal(guardado.elo, 1500);
    });

    it("los cambios del test ganan a los valores por defecto", () => {
        const e = f.equipo.create({ nombre: "Los Rapidos", elo: 2000 });
        assert.deepEqual([e.nombre, e.elo, e.victorias], ["Los Rapidos", 2000, 0]);
    });

    it("la secuencia hace nombres distintos aunque el azar repita", () => {
        const nombres = f.equipo.buildList(30).map((e) => e.nombre);
        assert.equal(new Set(nombres).size, 30);
    });

    it("traits: favorito/debil y estrella/capitan (y se pueden combinar con cambios)", () => {
        assert.equal(f.equipo.build({}, "favorito").elo, 1800);
        assert.equal(f.equipo.build({}, "debil").elo, 1200);
        const j = f.jugador.create({ edad: 30 }, "estrella");
        assert.deepEqual([j.rol, j.destacado, j.edad], ["duelista", true, 30]);
        assert.throws(() => f.equipo.build({}, "no-existe"), /No existe el trait/);
    });

    it("asociacion: un jugador sin equipo crea su equipo solo", () => {
        const j = f.jugador.create();
        assert.ok(almacen.buscar("equipos", j.equipoId));
    });

    it("equipoCompleto: 5 jugadores del mismo equipo y uno es capitan", () => {
        const e = f.equipoCompleto();
        assert.equal(e.jugadores.length, 5);
        assert.ok(e.jugadores.every((j) => j.equipoId === e.id && ROLES.includes(j.rol)));
        assert.equal(e.jugadores.filter((j) => j.capitan).length, 1);
    });

    it("partidaBody siempre da un marcador y mapa validos", () => {
        for (let i = 0; i < 50; i++) {
            const p = f.partidaBody();
            assert.ok(marcadorValido(p.rondasA, p.rondasB), `${p.rondasA}-${p.rondasB}`);
            assert.ok(MAPAS.includes(p.mapa));
        }
    });

    it("con la misma semilla salen exactamente los mismos datos", () => {
        const uno = crearFabricas(crearAlmacen(), { semilla: 7 }).equipo.buildList(5);
        const dos = crearFabricas(crearAlmacen(), { semilla: 7 }).equipo.buildList(5);
        const otra = crearFabricas(crearAlmacen(), { semilla: 8 }).equipo.buildList(5);
        assert.deepEqual(uno, dos);
        assert.notDeepEqual(uno, otra);
    });

    it("el aleatorio con semilla da numeros entre 0 y 1", () => {
        const azar = aleatorioConSemilla(123);
        const numeros = Array.from({ length: 1000 }, azar);
        assert.ok(numeros.every((n) => n >= 0 && n < 1));
        assert.ok(new Set(numeros).size > 990);
    });
});
