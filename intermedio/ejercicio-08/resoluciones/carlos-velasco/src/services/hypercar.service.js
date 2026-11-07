const hypercars = [
  { id: 1, modelo: 'Aerion S1', potencia_hp: 1180, velocidad_max: 402, precio_usd: 2100000 },
  { id: 2, modelo: 'Voltaro R', potencia_hp: 1021, velocidad_max: 386, precio_usd: 1750000 },
  { id: 3, modelo: 'Nucleo X', potencia_hp: 1352, velocidad_max: 431, precio_usd: 2950000 }
];

function listarHiperdeportivos() {
  return hypercars;
}

function obtenerHiperdeportivo(id) {
  return hypercars.find((actual) => actual.id === id) || null;
}

function registrarHiperdeportivo(datos) {
  if (!datos || typeof datos.modelo !== 'string' || datos.modelo.trim().length < 3) {
    return null;
  }
  if (!Number.isInteger(datos.potencia_hp) || datos.potencia_hp <= 0) return null;
  if (!Number.isInteger(datos.velocidad_max) || datos.velocidad_max <= 0) return null;
  if (!Number.isInteger(datos.precio_usd) || datos.precio_usd <= 0) return null;

  const nuevo = { id: hypercars.length + 1, ...datos, modelo: datos.modelo.trim() };
  hypercars.push(nuevo);
  return nuevo;
}

module.exports = { listarHiperdeportivos, obtenerHiperdeportivo, registrarHiperdeportivo };
