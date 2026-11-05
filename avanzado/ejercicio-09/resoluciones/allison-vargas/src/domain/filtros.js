export function construirFiltro({ peleadorId, categoria, metodo, desde, hasta } = {}) {
  return (c) => (peleadorId === undefined || c.rojoId === peleadorId || c.azulId === peleadorId)
    && (!categoria || c.categoria === categoria)
    && (!metodo || c.metodo === metodo)
    && (!desde || c.fecha >= desde)
    && (!hasta || c.fecha <= hasta);
}

export async function* filtrar(iterable, predicado) {
  for await (const elemento of iterable) {
    if (predicado(elemento)) yield elemento;
  }
}

export async function* tomar(iterable, cantidad) {
  if (cantidad <= 0) return;
  let entregados = 0;
  for await (const elemento of iterable) {
    yield elemento;
    entregados += 1;
    if (entregados >= cantidad) return;
  }
}
