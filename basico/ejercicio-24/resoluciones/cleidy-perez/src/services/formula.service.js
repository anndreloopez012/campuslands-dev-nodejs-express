const formulas = new Map([['1', { id: 1, name: 'Agua', formula: 'H2O', type: 'compuesto' }], ['2', { id: 2, name: 'Dióxido de carbono', formula: 'CO2', type: 'compuesto' }]]);
function normalize(input) { if (!input?.name?.trim() || !input?.formula?.trim()) throw new Error('name y formula son obligatorios'); if (!/^[A-Za-z0-9()]+$/.test(input.formula)) throw new Error('formula contiene caracteres no permitidos'); return { name: input.name.trim(), formula: input.formula.trim(), type: input.type?.trim() || 'compuesto' }; }
function list() { return [...formulas.values()]; }
function get(id) { return formulas.get(String(id)); }
function create(input) { const value = normalize(input); const id = Math.max(0, ...[...formulas.values()].map((item) => item.id)) + 1; const record = { id, ...value }; formulas.set(String(id), record); return record; }
function update(id, input) { const record = { id: Number(id), ...normalize(input) }; formulas.set(String(id), record); return record; }
function remove(id) { return formulas.delete(String(id)); }
module.exports = { list, get, create, update, remove };
