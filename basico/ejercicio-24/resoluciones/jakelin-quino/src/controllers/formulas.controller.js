const formulas = [
  { id: 1, name: 'Agua', formula: 'H2O', description: 'Dos atomos de hidrogeno y uno de oxigeno' },
  { id: 2, name: 'Dioxido de carbono', formula: 'CO2', description: 'Un atomo de carbono y dos de oxigeno' }
];
let nextId = 3;

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateFormula(body) {
  body = body || {};
  const { name, formula, description } = body;
  if ([name, formula, description].some((value) => typeof value !== 'string' || !value.trim())) {
    return 'El nombre, la formula y la descripcion son obligatorios';
  }
  return null;
}

function listFormulas() {
  return { statusCode: 200, body: { ok: true, data: formulas } };
}

function getFormula(value) {
  const id = parseId(value);
  if (!id) return { statusCode: 400, body: { ok: false, error: 'El id debe ser un entero positivo' } };

  const formula = formulas.find((item) => item.id === id);
  if (!formula) return { statusCode: 404, body: { ok: false, error: 'Formula no encontrada' } };
  return { statusCode: 200, body: { ok: true, data: formula } };
}

function createFormula(body) {
  const error = validateFormula(body);
  if (error) return { statusCode: 400, body: { ok: false, error } };

  const formula = {
    id: nextId++,
    name: body.name.trim(),
    formula: body.formula.trim(),
    description: body.description.trim()
  };
  formulas.push(formula);
  return { statusCode: 201, body: { ok: true, data: formula } };
}

function updateFormula(value, body) {
  const id = parseId(value);
  if (!id) return { statusCode: 400, body: { ok: false, error: 'El id debe ser un entero positivo' } };
  const formula = formulas.find((item) => item.id === id);
  if (!formula) return { statusCode: 404, body: { ok: false, error: 'Formula no encontrada' } };

  const error = validateFormula(body);
  if (error) return { statusCode: 400, body: { ok: false, error } };
  Object.assign(formula, {
    name: body.name.trim(),
    formula: body.formula.trim(),
    description: body.description.trim()
  });
  return { statusCode: 200, body: { ok: true, data: formula } };
}

function deleteFormula(value) {
  const id = parseId(value);
  if (!id) return { statusCode: 400, body: { ok: false, error: 'El id debe ser un entero positivo' } };
  const index = formulas.findIndex((item) => item.id === id);
  if (index === -1) return { statusCode: 404, body: { ok: false, error: 'Formula no encontrada' } };

  const [deleted] = formulas.splice(index, 1);
  return { statusCode: 200, body: { ok: true, data: deleted } };
}

module.exports = { listFormulas, getFormula, createFormula, updateFormula, deleteFormula };