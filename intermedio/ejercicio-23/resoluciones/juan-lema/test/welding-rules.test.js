import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { recommendParameters, canTransition, PROCESS_NAMES, MATERIAL_NAMES, STATUSES, MAX_AMPERAGE } from "../src/services/welding-rules.js";

describe("recommendParameters: corriente y pasadas", () => {
  const cases = [
    { input: { process: "MIG", material: "acero", thicknessMm: 3 }, expected: { amperage: 120, passes: 1 } },
    { input: { process: "MIG", material: "acero", thicknessMm: 0.5 }, expected: { amperage: 20, passes: 1 } },
    { input: { process: "TIG", material: "acero", thicknessMm: 6 }, expected: { amperage: 210, passes: 1 } },
    { input: { process: "TIG", material: "acero", thicknessMm: 6.5 }, expected: { amperage: 228, passes: 2 } },
    { input: { process: "SMAW", material: "acero", thicknessMm: 10 }, expected: { amperage: 300, passes: 2 } },
    { input: { process: "SMAW", material: "acero inoxidable", thicknessMm: 10 }, expected: { amperage: 270, passes: 2 } },
    { input: { process: "TIG", material: "aluminio", thicknessMm: 4 }, expected: { amperage: 168, passes: 1 } },
    { input: { process: "TIG", material: "acero inoxidable", thicknessMm: 2 }, expected: { amperage: 63, passes: 1 } },
    { input: { process: "MIG", material: "acero", thicknessMm: 10 }, expected: { amperage: 400, passes: 2 } },
    { input: { process: "MIG", material: "acero", thicknessMm: 10.1 }, expected: { amperage: 400, passes: 2 } },
    { input: { process: "MIG", material: "aluminio", thicknessMm: 10 }, expected: { amperage: 400, passes: 2 } },
    { input: { process: "MIG", material: "acero", thicknessMm: 25 }, expected: { amperage: 400, passes: 5 } },
  ];

  for (const { input, expected } of cases) {
    it(`${input.process} / ${input.material} / ${input.thicknessMm} mm -> ${expected.amperage} A en ${expected.passes} pasada(s)`, () => {
      assert.deepEqual(recommendParameters(input), expected);
    });
  }

  it("el limite de la maquina es 400 A", () => {
    assert.equal(MAX_AMPERAGE, 400);
  });

  it("nunca supera la corriente maxima ni baja de 1 A en todo el rango soportado", () => {
    for (const process of PROCESS_NAMES) {
      for (const material of MATERIAL_NAMES) {
        for (let thicknessMm = 0.5; thicknessMm <= 25; thicknessMm += 0.5) {
          const { amperage } = recommendParameters({ process, material, thicknessMm });
          assert.ok(amperage >= 1 && amperage <= MAX_AMPERAGE, `${process}/${material}/${thicknessMm} mm dio ${amperage} A`);
        }
      }
    }
  });

  it("a mayor espesor nunca baja ni la corriente ni las pasadas", () => {
    for (const process of PROCESS_NAMES) {
      for (const material of MATERIAL_NAMES) {
        let previous = recommendParameters({ process, material, thicknessMm: 0.5 });

        for (let thicknessMm = 1; thicknessMm <= 25; thicknessMm += 0.5) {
          const current = recommendParameters({ process, material, thicknessMm });
          assert.ok(current.amperage >= previous.amperage && current.passes >= previous.passes, `retrocede en ${process}/${material}/${thicknessMm} mm`);
          previous = current;
        }
      }
    }
  });

  it("para el mismo espesor: aluminio > acero > acero inoxidable", () => {
    const amperageOf = (material) => recommendParameters({ process: "MIG", material, thicknessMm: 2 }).amperage;

    assert.ok(amperageOf("aluminio") > amperageOf("acero"));
    assert.ok(amperageOf("acero") > amperageOf("acero inoxidable"));
  });

  it("es pura: no muta la entrada y repite el resultado", () => {
    const input = Object.freeze({ process: "TIG", material: "aluminio", thicknessMm: 4 });

    assert.deepEqual(recommendParameters(input), recommendParameters(input));
    assert.deepEqual(input, { process: "TIG", material: "aluminio", thicknessMm: 4 });
  });
});

describe("recommendParameters: pasadas segun el espesor (6 mm por pasada)", () => {
  const boundaries = [
    [0.5, 1],
    [6, 1],
    [6.01, 2],
    [12, 2],
    [12.01, 3],
    [25, 5],
  ];

  for (const [thicknessMm, passes] of boundaries) {
    it(`${thicknessMm} mm -> ${passes} pasada(s)`, () => {
      assert.equal(recommendParameters({ process: "SMAW", material: "acero", thicknessMm }).passes, passes);
    });
  }
});

describe("canTransition: maquina de estados de una soldadura", () => {
  const allowed = [
    ["pendiente", "en_proceso"],
    ["pendiente", "cancelado"],
    ["en_proceso", "terminado"],
    ["en_proceso", "cancelado"],
  ];

  for (const [from, to] of allowed) {
    it(`permite ${from} -> ${to}`, () => {
      assert.equal(canTransition(from, to), true);
    });
  }

  const forbidden = [
    ["pendiente", "terminado"],
    ["pendiente", "pendiente"],
    ["en_proceso", "pendiente"],
    ["en_proceso", "en_proceso"],
  ];

  for (const [from, to] of forbidden) {
    it(`rechaza ${from} -> ${to}`, () => {
      assert.equal(canTransition(from, to), false);
    });
  }

  it("los estados finales (terminado y cancelado) no permiten ninguna transicion", () => {
    for (const from of ["terminado", "cancelado"]) {
      for (const to of STATUSES) assert.equal(canTransition(from, to), false, `${from} -> ${to}`);
    }
  });

  it("estados desconocidos, vacios o de prototipo se rechazan sin lanzar error", () => {
    for (const from of ["desconocido", "", undefined, null, 42, "constructor", "__proto__", "toString", "hasOwnProperty"]) {
      assert.equal(canTransition(from, "terminado"), false, `desde ${String(from)}`);
    }
    assert.equal(canTransition("pendiente", "desconocido"), false);
    assert.equal(canTransition("pendiente", undefined), false);
  });
});
