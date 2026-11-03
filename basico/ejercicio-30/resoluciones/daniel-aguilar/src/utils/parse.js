const { badRequest } = require('./app-error');

function parseId(raw, name = 'id') {
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) throw badRequest(`${name} debe ser un entero positivo`);
  return id;
}

module.exports = { parseId };
