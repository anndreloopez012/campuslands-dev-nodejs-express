import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { calculateHeatInput, classifyWeldQuality } from "../src/utils/weldingCalculator.js";
import { BadRequestError } from "../src/utils/customErrors.js";

describe("Suite de Pruebas Nativas (node:test) — Cálculos de Soldadura", () => {
  it("Debe calcular correctamente el aporte térmico (Heat Input kJ/mm) para proceso MIG", () => {
    const heatInput = calculateHeatInput({
      voltage: 24,
      amperage: 200,
      travelSpeedMmMin: 180,
      weldingProcess: "MIG"
    });
    // (24 * 200 * 60 * 0.8) / (1000 * 180) = 1.28 kJ/mm
    assert.equal(heatInput, 1.28);
  });

  it("Debe clasificar el cordón como Aprobado_AWS_D1_1 cuando el aporte está entre 0.5 y 2.5 kJ/mm", () => {
    assert.equal(classifyWeldQuality(1.28), "Aprobado_AWS_D1_1");
    assert.equal(classifyWeldQuality(0.35), "Falta_Penetracion");
    assert.equal(classifyWeldQuality(3.1), "Sobrecalentamiento_ZAC");
  });

  it("Debe lanzar BadRequestError cuando el proceso de soldadura no existe", () => {
    assert.throws(
      () =>
        calculateHeatInput({
          voltage: 20,
          amperage: 150,
          travelSpeedMmMin: 100,
          weldingProcess: "LASER_DESCONOCIDO"
        }),
      (err) => err instanceof BadRequestError && err.statusCode === 400
    );
  });

  it("Debe lanzar BadRequestError cuando la velocidad de avance es 0 o negativa", () => {
    assert.throws(
      () =>
        calculateHeatInput({
          voltage: 22,
          amperage: 160,
          travelSpeedMmMin: 0,
          weldingProcess: "TIG"
        }),
      BadRequestError
    );
  });
});
