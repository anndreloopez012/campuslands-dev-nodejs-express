import { test } from "node:test";
import assert from "node:assert/strict";
import { roomGeometry } from "./geometry.service.js";
import { estimateMaterials } from "./materials.service.js";
import { toModelMillimeters } from "./scale.service.js";
import { estimateRoom } from "./estimate.service.js";

test("roomGeometry calcula areas descontando aberturas", () => {
    const geometry = roomGeometry({ width: 4, length: 5, height: 2.5, openings: [{ width: 1, height: 2 }] });
    assert.deepEqual(geometry, { floorArea: 20, perimeter: 18, wallArea: 43, volume: 50 });
});

test("roomGeometry rechaza dimensiones invalidas", () => {
    assert.throws(() => roomGeometry({ width: 0, length: 5, height: 2.5 }), /width debe ser un numero mayor a 0/);
});

test("estimateMaterials redondea hacia arriba y suma el total", () => {
    const materials = estimateMaterials({ wallArea: 43, floorArea: 20 }, { coats: 2 });
    assert.equal(materials.items[0].quantity, 9);
    assert.equal(materials.items[1].quantity, 9);
    assert.equal(materials.total, 9 * 8.5 + 9 * 42);
});

test("toModelMillimeters convierte a escala 1:50", () => {
    assert.equal(toModelMillimeters(4, "1:50").modelMillimeters, 80);
});

test("estimateRoom compone los servicios", () => {
    const result = estimateRoom({ name: "Sala", width: 4, length: 5, height: 2.5 });
    assert.equal(result.geometry.volume, 50);
    assert.equal(result.materials.coats, 2);
    assert.equal(result.model.width, 80);
});
