import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildLoadoutFactory, COMPETITIVE_FIXTURES } from "../src/services/loadouts.service.js";

describe("Avanzado 26 — Fixtures y Factories (Shooters Competitivos)", () => {
  it("Debe disponer de fixtures deterministas predefinidos", () => {
    assert.equal(Array.isArray(COMPETITIVE_FIXTURES), true);
    assert.equal(COMPETITIVE_FIXTURES.length >= 2, true);
  });

  it("buildLoadoutFactory debe generar objetos válidos con valores por defecto y overrides", () => {
    const customLoadout = buildLoadoutFactory({ proPlayer: "TenZ", primaryWeapon: "Vandal Kuronami" });
    assert.equal(customLoadout.proPlayer, "TenZ");
    assert.equal(customLoadout.primaryWeapon, "Vandal Kuronami");
    assert.equal(typeof customLoadout.edpi, "number");
  });
});
