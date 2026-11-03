// tests UNITARIOS: solo funciones puras, sin HTTP ni archivos
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dano, ganarExperiencia, pelear, statsTotales, xpParaSubir } from "../../src/juego/reglas.js";

const base = { nivel: 1, experiencia: 0, vidaMax: 120, ataque: 14, defensa: 8, equipo: [] };

describe("reglas del RPG", () => {
    it("xp para subir crece con el nivel", () => {
        assert.deepEqual([1, 2, 5].map(xpParaSubir), [100, 200, 500]);
    });

    it("ganar experiencia puede subir varios niveles de una", () => {
        // 100 para el 2, 200 para el 3 -> con 350 llega a nivel 3 y sobran 50
        const p = ganarExperiencia(base, 350);
        assert.deepEqual([p.nivel, p.experiencia, p.vidaMax, p.ataque], [3, 50, 140, 18]);
    });

    it("no muta el personaje original", () => {
        ganarExperiencia(base, 500);
        assert.equal(base.nivel, 1);
    });

    it("el equipo suma a los stats", () => {
        assert.deepEqual(statsTotales({ ...base, equipo: ["espada-larga", "escudo-roble"] }), { ataque: 20, defensa: 13 });
    });

    it("el dano minimo es 1 aunque la defensa sea enorme", () => {
        assert.equal(dano(5, 100, () => 0), 1);
        assert.equal(dano(14, 4, () => 0.99), 15);
    });

    it("pelea determinista si el dado siempre da lo mismo", () => {
        // slime: 30 de vida, defensa 1. Golpe = 14 + 0 - 1 = 13 -> 3 turnos
        const r = pelear(base, { vida: 30, ataque: 6, defensa: 1 }, () => 0);
        assert.equal(r.gano, true);
        assert.equal(r.turnos.length, 3);
        assert.equal(r.turnos.at(-1).recibido, 0); // el slime ya no pega en el ultimo turno
    });
});
