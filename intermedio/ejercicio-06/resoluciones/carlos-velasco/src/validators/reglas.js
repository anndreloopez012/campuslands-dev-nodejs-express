const reglas = {
  requerido: (mensaje) => (valor) =>
    valor !== undefined && valor !== null && String(valor).trim() !== '' ? true : mensaje,
  texto: (minimo, maximo) => (valor) =>
    typeof valor === 'string' && valor.trim().length >= minimo && valor.trim().length <= maximo
      ? true
      : `Debe ser texto entre ${minimo} y ${maximo} caracteres`,
  entero: (minimo, maximo) => (valor) =>
    Number.isInteger(valor) && valor >= minimo && valor <= maximo
      ? true
      : `Debe ser un entero entre ${minimo} y ${maximo}`,
  numero: (minimo) => (valor) =>
    typeof valor === 'number' && !Number.isNaN(valor) && valor >= minimo ? true : `Debe ser un numero mayor o igual a ${minimo}`,
  enum: (valores) => (valor) =>
    valores.includes(valor) ? true : `Debe ser uno de: ${valores.join(', ')}`
};

/**
 * Corre una lista de reglas sobre un valor y devuelve
 * el primer mensaje de error, o null si todo pasa.
 */
function aplicarReglas(valor, listaReglas) {
  for (const regla of listaReglas) {
    const resultado = regla(valor);
    if (resultado !== true) return resultado;
  }
  return null;
}

module.exports = { reglas, aplicarReglas };
