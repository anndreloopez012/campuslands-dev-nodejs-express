import { LIMITES } from '../constants/peliculas.js';

const sangrar = (texto, nivel) => texto.split('\n').map((linea) => ' '.repeat(nivel) + linea).join('\n');
const bloque = (valor, nivel) => sangrar(JSON.stringify(valor, null, 2), nivel);

function* agrupar(iterable, tamano) {
  let grupo = [];
  for (const elemento of iterable) {
    grupo.push(elemento);
    if (grupo.length === tamano) {
      yield grupo;
      grupo = [];
    }
  }
  if (grupo.length) yield grupo;
}

function* ndjson(filas) {
  for (const grupo of agrupar(filas, LIMITES.filasPorTrozo)) {
    yield grupo.map((fila) => `${JSON.stringify(fila())}\n`).join('');
  }
}

function* arreglo(filas, { pretty, nivel, prefijo = '', sufijo = '' }) {
  const separador = pretty ? ',\n' : ',';
  let primero = true;
  yield `${prefijo}[`;
  for (const grupo of agrupar(filas, LIMITES.filasPorTrozo)) {
    const textos = grupo.map((fila) => (pretty ? bloque(fila(), nivel + 2) : JSON.stringify(fila())));
    yield `${primero ? (pretty ? '\n' : '') : separador}${textos.join(separador)}`;
    primero = false;
  }
  yield `${pretty && !primero ? `\n${' '.repeat(nivel)}` : ''}]${sufijo}`;
}

export function* trozosJson({
  forma, pretty, meta, filas,
}) {
  if (forma === 'ndjson') {
    yield* ndjson(filas);
  } else if (forma === 'arreglo') {
    yield* arreglo(filas, { pretty, nivel: 0 });
  } else if (pretty) {
    const metaTexto = JSON.stringify(meta, null, 2).split('\n').map((l, i) => (i === 0 ? l : `  ${l}`)).join('\n');
    yield* arreglo(filas, { pretty, nivel: 2, prefijo: `{\n  "meta": ${metaTexto},\n  "datos": `, sufijo: '\n}' });
  } else {
    yield* arreglo(filas, { pretty, nivel: 0, prefijo: `{"meta":${JSON.stringify(meta)},"datos":`, sufijo: '}' });
  }
}
