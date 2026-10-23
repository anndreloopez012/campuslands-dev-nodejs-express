import { DomainError } from "../errors.js";
import { analyzeFormula, isKnownElement } from "./chemistry.service.js";

const ID_PATTERN = /^[1-9]\d*$/;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 60;

const nameKey = (name) => name.trim().normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

function createCompoundsService({ seed = [] } = {}) {
  const compounds = [];
  let nextId = 1;

  function register(input) {
    const { name, formula } = input ?? {};
    if (typeof name !== "string" || name.trim().length < MIN_NAME_LENGTH || name.trim().length > MAX_NAME_LENGTH) throw new DomainError("INVALID_INPUT", `name debe tener entre ${MIN_NAME_LENGTH} y ${MAX_NAME_LENGTH} caracteres`);

    const analysis = analyzeFormula(formula);
    const existing = compounds.find((compound) => nameKey(compound.name) === nameKey(name));
    if (existing) throw new DomainError("DUPLICATE_NAME", `Ya existe un compuesto llamado "${existing.name}" (id ${existing.id})`);

    const compound = { id: nextId++, name: name.trim(), ...analysis };
    compounds.push(compound);
    return structuredClone(compound);
  }

  function list({ element } = {}) {
    if (element !== undefined && !isKnownElement(element)) throw new DomainError("UNKNOWN_ELEMENT", `Elemento desconocido: ${element}`);

    return structuredClone(element === undefined ? compounds : compounds.filter((compound) => Object.hasOwn(compound.composition, element)));
  }

  function getById(id) {
    if (!ID_PATTERN.test(String(id))) throw new DomainError("INVALID_INPUT", "id debe ser un entero positivo");

    const compound = compounds.find((c) => c.id === Number(id));
    if (!compound) throw new DomainError("NOT_FOUND", `Compuesto con id ${id} no encontrado`);

    return structuredClone(compound);
  }

  seed.forEach(register);
  return { register, list, getById };
}

const compoundsService = createCompoundsService({
  seed: [
    { name: "Agua", formula: "H2O" },
    { name: "Sal de mesa", formula: "NaCl" },
    { name: "Glucosa", formula: "C6H12O6" },
    { name: "Sulfato de cobre pentahidratado", formula: "CuSO4·5H2O" },
  ],
});

export { createCompoundsService, compoundsService };
