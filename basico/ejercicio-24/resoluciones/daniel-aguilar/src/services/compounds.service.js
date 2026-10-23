const store = require('../store/compounds.store');

const CATEGORIES = ['organico', 'inorganico'];
// Formula simple: simbolos de elementos (Mayuscula + minuscula opcional) con subindices. Ej: H2O, NaCl, C6H12O6.
const FORMULA_REGEX = /^([A-Z][a-z]?\d*)+$/;

function serviceError(status, message, details) {
  const error = new Error(message);
  error.status = status;
  if (details) error.details = details;
  return error;
}

function validate(data) {
  const details = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw serviceError(400, 'Datos invalidos', ['El cuerpo debe ser un objeto JSON']);
  }
  if (typeof data.name !== 'string' || data.name.trim().length < 2) details.push('name debe tener al menos 2 caracteres');
  if (typeof data.formula !== 'string' || !FORMULA_REGEX.test(data.formula.trim())) {
    details.push('formula invalida (ejemplos: H2O, NaCl, C6H12O6)');
  }
  if (typeof data.molarMass !== 'number' || !(data.molarMass > 0)) details.push('molarMass debe ser un numero mayor a 0');
  if (!CATEGORIES.includes(data.category)) details.push(`category debe ser una de: ${CATEGORIES.join(', ')}`);
  if (details.length > 0) throw serviceError(400, 'Datos invalidos', details);

  return {
    name: data.name.trim(),
    formula: data.formula.trim(),
    molarMass: data.molarMass,
    category: data.category,
  };
}

function assertUniqueFormula(formula, ignoreId) {
  const duplicated = store.all().some((item) => item.formula === formula && item.id !== ignoreId);
  if (duplicated) throw serviceError(409, `Ya existe un compuesto con la formula ${formula}`);
}

// READ
const list = (category) => store.all().filter((item) => !category || item.category === category);

function get(id) {
  const item = store.find(id);
  if (!item) throw serviceError(404, `El compuesto ${id} no existe`);
  return item;
}

// CREATE
function create(data) {
  const clean = validate(data);
  assertUniqueFormula(clean.formula);
  return store.insert(clean);
}

// UPDATE (PUT reemplaza el recurso completo: se exigen todos los campos)
function update(id, data) {
  get(id);
  const clean = validate(data);
  assertUniqueFormula(clean.formula, id);
  return store.replace(id, clean);
}

// DELETE
function remove(id) {
  if (!store.remove(id)) throw serviceError(404, `El compuesto ${id} no existe`);
}

module.exports = { CATEGORIES, list, get, create, update, remove };
