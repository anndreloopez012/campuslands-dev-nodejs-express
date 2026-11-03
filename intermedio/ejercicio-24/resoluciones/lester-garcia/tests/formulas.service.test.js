import { describe, it, beforeEach } from "node:test";
import assert from "node:assert/strict";
import {
  classifyPhLevel,
  calculateMolarity,
  getFormulaByIdService,
  createFormulaService
} from "../src/services/formulas.service.js";
import { resetFormulasStore } from "../src/repositories/formulas.inMemory.repository.js";
import { NotFoundError, ConflictError, BadRequestError } from "../src/utils/customErrors.js";

describe("Testing Unitario de Capa de Servicios — formulas.service.js", () => {
  beforeEach(() => {
    resetFormulasStore([
      {
        id: "CHM-01",
        commonName: "Ácido Sulfúrico",
        molecularFormula: "H2SO4",
        molarMassGmol: 98.079,
        phLevel: 1.2,
        acidityCategory: "Acido_Fuerte",
        molarityMolL: 0.51,
        createdAt: "2026-10-10T10:00:00.000Z"
      }
    ]);
  });

  it("Debe clasificar correctamente la categoría ácida/básica según el pH", () => {
    assert.equal(classifyPhLevel(1.5), "Acido_Fuerte");
    assert.equal(classifyPhLevel(5.0), "Acido_Debil");
    assert.equal(classifyPhLevel(7.0), "Neutro");
    assert.equal(classifyPhLevel(9.0), "Base_Debil");
    assert.equal(classifyPhLevel(13.2), "Base_Fuerte");
  });

  it("Debe calcular la molaridad (mol/L) a partir de gramos, masa molar y volumen", () => {
    // 58.44 g de NaCl (masa molar 58.44 g/mol) en 2 litros = 0.50 mol/L
    const molarity = calculateMolarity({
      soluteGrams: 58.44,
      molarMassGmol: 58.44,
      solutionVolumeLiters: 2
    });
    assert.equal(molarity, 0.5);
  });

  it("Debe registrar una nueva fórmula química enriquecida con molaridad y categoría de acidez", async () => {
    const created = await createFormulaService({
      commonName: "Cloruro de Sodio",
      molecularFormula: "NaCl",
      molarMassGmol: 58.44,
      phLevel: 7.0,
      soluteGrams: 58.44,
      solutionVolumeLiters: 1
    });

    assert.equal(created.id, "CHM-02");
    assert.equal(created.acidityCategory, "Neutro");
    assert.equal(created.molarityMolL, 1);
  });

  it("Debe rechazar con ConflictError (409) una fórmula molecular duplicada", async () => {
    await assert.rejects(
      async () => {
        await createFormulaService({
          commonName: "Ácido Sulfúrico Duplicado",
          molecularFormula: "h2so4",
          molarMassGmol: 98.079,
          phLevel: 1.0,
          soluteGrams: 50,
          solutionVolumeLiters: 1
        });
      },
      (err) => err instanceof ConflictError && err.statusCode === 409
    );
  });

  it("Debe rechazar con NotFoundError (404) cuando se busca un ID inexistente", async () => {
    await assert.rejects(
      async () => {
        await getFormulaByIdService("CHM-999");
      },
      (err) => err instanceof NotFoundError && err.statusCode === 404
    );
  });

  it("Debe lanzar BadRequestError (400) si el pH está fuera de la escala 0-14", () => {
    assert.throws(() => classifyPhLevel(15.5), BadRequestError);
  });
});
