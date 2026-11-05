const MARCADOR = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

export const ALEATORIO = 'aleatorio';

export function sustituir(texto, resolver) {
  return texto.replace(MARCADOR, (_, nombre) => resolver(nombre));
}

export function variablesDe(texto) {
  return [...texto.matchAll(MARCADOR)].map((coincidencia) => coincidencia[1]);
}

export function variablesDelPaso(paso) {
  return [...variablesDe(paso.ruta), ...variablesDe(paso.cuerpo ?? '')];
}

export function tipoDe(paso) {
  return paso.tipo ?? (paso.cuerpo === undefined ? null : 'application/json');
}
