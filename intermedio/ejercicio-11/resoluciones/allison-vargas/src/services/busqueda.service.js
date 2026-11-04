import { ValidationError } from '../utils/errors.js';

const PARAMETROS = ['q', 'campos', 'modo', 'coincidencia', 'orden', 'pagina', 'limite'];
const MODOS = ['todos', 'alguno'];
const COINCIDENCIAS = ['exacta', 'prefijo', 'contiene'];
const CALIDAD = { exacta: 1, prefijo: 0.6, contiene: 0.3 };
const BONO_FRASE = 1.5;
const LARGO_MINIMO_Q = 2;
const LARGO_MAXIMO_Q = 80;

const collator = new Intl.Collator('es', { sensitivity: 'base', numeric: true });
const indices = new WeakMap();

export function alinear(texto) {
  return String(texto)
    .split('')
    .map((caracter) => {
      const base = caracter.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
      return base.length === 1 ? base : ' ';
    })
    .join('');
}

export const limpiar = (texto) => alinear(texto).replace(/[^a-z0-9]+/g, ' ').trim();

function indexar(item, config) {
  const existente = indices.get(item);
  if (existente) return existente;

  const indice = {};
  for (const campo of Object.keys(config.campos)) {
    const bruto = item[campo];
    const texto = Array.isArray(bruto) ? bruto.join(' ') : String(bruto ?? '');
    const alineado = alinear(texto);
    const limpio = alineado.replace(/[^a-z0-9]+/g, ' ').trim();
    indice[campo] = { texto, alineado, limpio, tokens: limpio ? limpio.split(' ') : [] };
  }
  indices.set(item, indice);
  return indice;
}

function filtrarParametros(query, errores) {
  const validos = {};
  for (const [clave, valor] of Object.entries(query)) {
    if (!PARAMETROS.includes(clave)) {
      errores.push({ campo: clave, mensaje: 'parametro no permitido' });
    } else if (typeof valor !== 'string') {
      errores.push({ campo: clave, mensaje: 'no puede repetirse ni enviarse como objeto' });
    } else {
      validos[clave] = valor;
    }
  }
  return validos;
}

function agregarTermino(destino, termino) {
  if (!destino.some((t) => t.tipo === termino.tipo && t.texto === termino.texto)) {
    destino.push(termino);
  }
}

export function leerConsulta(q, config, errores) {
  const texto = q.trim();
  if (texto.length < LARGO_MINIMO_Q || texto.length > LARGO_MAXIMO_Q) {
    errores.push({ campo: 'q', mensaje: `q debe tener entre ${LARGO_MINIMO_Q} y ${LARGO_MAXIMO_Q} caracteres` });
    return null;
  }

  const positivos = [];
  const negativos = [];

  for (const coincidencia of texto.matchAll(/(-?)"([^"]*)"|(-?)(\S+)/g)) {
    const excluir = (coincidencia[1] || coincidencia[3]) === '-';
    const destino = excluir ? negativos : positivos;

    if (coincidencia[2] !== undefined) {
      const frase = limpiar(coincidencia[2]);
      if (!frase) continue;
      const tipo = frase.includes(' ') ? 'frase' : 'termino';
      agregarTermino(destino, { tipo, texto: frase, excluir });
    } else {
      for (const palabra of limpiar(coincidencia[4]).split(' ').filter(Boolean)) {
        agregarTermino(destino, { tipo: 'termino', texto: palabra, excluir });
      }
    }
  }

  if (!positivos.length) {
    errores.push({ campo: 'q', mensaje: 'debe incluir al menos un termino valido de busqueda (letras o numeros), no solo exclusiones' });
    return null;
  }
  if (positivos.length + negativos.length > config.maxTerminos) {
    errores.push({ campo: 'q', mensaje: `maximo ${config.maxTerminos} terminos por busqueda` });
    return null;
  }
  const corto = positivos.find((t) => t.tipo === 'termino' && t.texto.length < 2);
  if (corto) {
    errores.push({ campo: 'q', mensaje: `el termino "${corto.texto}" es demasiado corto (minimo 2 caracteres)` });
    return null;
  }
  return { original: texto, positivos, negativos };
}

function leerCampos(validos, config, errores) {
  const disponibles = Object.keys(config.campos);
  if (validos.campos === undefined) return disponibles;

  const campos = [];
  for (const nombre of validos.campos.split(',').map((c) => c.trim())) {
    if (!Object.hasOwn(config.campos, nombre)) {
      errores.push({ campo: 'campos', mensaje: `${nombre || '(vacio)'} no es un campo de busqueda. Validos: ${disponibles.join(', ')}` });
    } else if (campos.includes(nombre)) {
      errores.push({ campo: 'campos', mensaje: `${nombre} esta repetido` });
    } else {
      campos.push(nombre);
    }
  }
  return campos;
}

function leerOpcion(validos, clave, permitidos, porDefecto, errores) {
  if (validos[clave] === undefined) return porDefecto;
  const valor = validos[clave].trim().toLowerCase();
  if (!permitidos.includes(valor)) {
    errores.push({ campo: clave, mensaje: `${clave} debe ser uno de: ${permitidos.join(', ')}` });
    return porDefecto;
  }
  return valor;
}

function leerEntero(validos, clave, porDefecto, minimo, maximo, errores) {
  if (validos[clave] === undefined) return porDefecto;
  const texto = validos[clave].trim();
  if (!/^\d+$/.test(texto)) {
    errores.push({ campo: clave, mensaje: `${clave} debe ser un entero` });
    return porDefecto;
  }
  const numero = Number(texto);
  if (numero < minimo || numero > maximo) {
    errores.push({ campo: clave, mensaje: `${clave} debe estar entre ${minimo} y ${maximo}` });
    return porDefecto;
  }
  return numero;
}

function calidadTermino(tokens, termino, coincidencia) {
  if (tokens.includes(termino)) return 1;
  if (coincidencia !== 'exacta' && tokens.some((token) => token.startsWith(termino))) return CALIDAD.prefijo;
  if (coincidencia === 'contiene' && tokens.some((token) => token.includes(termino))) return CALIDAD.contiene;
  return 0;
}

function valorEnCampo(termino, entrada, coincidencia) {
  if (termino.tipo === 'frase') {
    return ` ${entrada.limpio} `.includes(` ${termino.texto} `) ? BONO_FRASE : 0;
  }
  return calidadTermino(entrada.tokens, termino.texto, coincidencia);
}

function evaluar(item, consulta, config, campos, modo, coincidencia) {
  const indice = indexar(item, config);

  for (const termino of consulta.negativos) {
    if (campos.some((campo) => valorEnCampo(termino, indice[campo], coincidencia) > 0)) return null;
  }

  let puntaje = 0;
  let cumplidos = 0;
  for (const termino of consulta.positivos) {
    let mejor = 0;
    for (const campo of campos) {
      const valor = valorEnCampo(termino, indice[campo], coincidencia) * config.campos[campo].peso;
      if (valor > mejor) mejor = valor;
    }
    if (mejor > 0) {
      cumplidos += 1;
      puntaje += mejor;
    }
  }

  const cumple = modo === 'todos' ? cumplidos === consulta.positivos.length : cumplidos > 0;
  return cumple ? puntaje : null;
}

function patron(termino, coincidencia) {
  if (termino.tipo === 'frase') {
    return `(?<![a-z0-9])${termino.texto.split(' ').join('[^a-z0-9]+')}(?![a-z0-9])`;
  }
  if (coincidencia === 'exacta') return `(?<![a-z0-9])${termino.texto}(?![a-z0-9])`;
  if (coincidencia === 'prefijo') return `(?<![a-z0-9])${termino.texto}`;
  return termino.texto;
}

function rangosDe(alineado, consulta, coincidencia) {
  const rangos = [];
  for (const termino of consulta.positivos) {
    for (const hallazgo of alineado.matchAll(new RegExp(patron(termino, coincidencia), 'g'))) {
      rangos.push([hallazgo.index, hallazgo.index + hallazgo[0].length]);
    }
  }
  rangos.sort((a, b) => a[0] - b[0]);

  const unidos = [];
  for (const rango of rangos) {
    const ultimo = unidos[unidos.length - 1];
    if (ultimo && rango[0] <= ultimo[1]) ultimo[1] = Math.max(ultimo[1], rango[1]);
    else unidos.push([...rango]);
  }
  return unidos;
}

function marcar(texto, rangos) {
  let resultado = '';
  let cursor = 0;
  for (const [inicio, fin] of rangos) {
    resultado += `${texto.slice(cursor, inicio)}<mark>${texto.slice(inicio, fin)}</mark>`;
    cursor = fin;
  }
  return resultado + texto.slice(cursor);
}

function resaltar(item, consulta, config, campos, coincidencia) {
  const indice = indexar(item, config);
  const resaltado = {};

  for (const campo of campos) {
    const definicion = config.campos[campo];
    if (!definicion.resaltar) continue;

    const { texto, alineado } = indice[campo];
    const rangos = rangosDe(alineado, consulta, coincidencia);
    if (!rangos.length) continue;

    if (definicion.fragmento && texto.length > 90) {
      const inicio = Math.max(0, rangos[0][0] - 30);
      const fin = Math.min(texto.length, rangos[0][1] + 50);
      const recorte = rangos
        .filter(([desde, hasta]) => desde >= inicio && hasta <= fin)
        .map(([desde, hasta]) => [desde - inicio, hasta - inicio]);
      resaltado[campo] = `${inicio > 0 ? '...' : ''}${marcar(texto.slice(inicio, fin), recorte)}${fin < texto.length ? '...' : ''}`;
    } else {
      resaltado[campo] = marcar(texto, rangos);
    }
  }
  return resaltado;
}

function compararCampo(orden, a, b) {
  const x = a[orden.campo];
  const y = b[orden.campo];
  const resultado = orden.tipo === 'texto' ? collator.compare(String(x), String(y)) : x - y;
  return resultado * orden.sentido;
}

export function buscar(items, query, config) {
  const errores = [];
  const validos = filtrarParametros(query, errores);

  let consulta = null;
  if (validos.q !== undefined) {
    consulta = leerConsulta(validos.q, config, errores);
  }

  const campos = leerCampos(validos, config, errores);
  const modo = leerOpcion(validos, 'modo', MODOS, 'todos', errores);
  const coincidencia = leerOpcion(validos, 'coincidencia', COINCIDENCIAS, 'prefijo', errores);
  const opcionesOrden = ['relevancia', ...Object.keys(config.ordenes)];
  const ordenPedido = leerOpcion(validos, 'orden', opcionesOrden, 'relevancia', errores);
  const pagina = leerEntero(validos, 'pagina', 1, 1, 100000, errores);
  const limite = leerEntero(validos, 'limite', config.limiteDefault, 1, config.limiteMax, errores);

  if (errores.length) {
    throw new ValidationError('Parametros de busqueda invalidos', errores, 'BUSQUEDA_INVALIDA');
  }

  const ordenAplicado = ordenPedido === 'relevancia' && !consulta ? config.ordenSinBusqueda : ordenPedido;
  const desempate = config.ordenes[config.desempate];

  let resultados;
  if (consulta) {
    resultados = [];
    for (const item of items) {
      const puntaje = evaluar(item, consulta, config, campos, modo, coincidencia);
      if (puntaje !== null) resultados.push({ item, puntaje });
    }
  } else {
    resultados = items.map((item) => ({ item, puntaje: 0 }));
  }

  resultados.sort((a, b) => {
    if (ordenAplicado === 'relevancia') {
      if (a.puntaje !== b.puntaje) return b.puntaje - a.puntaje;
    } else {
      const resultado = compararCampo(config.ordenes[ordenAplicado], a.item, b.item);
      if (resultado !== 0) return resultado;
    }
    return compararCampo(desempate, a.item, b.item) || a.item.id - b.item.id;
  });

  const total = resultados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const inicio = (pagina - 1) * limite;

  const data = resultados.slice(inicio, inicio + limite).map(({ item, puntaje }) => {
    if (!consulta) return item;
    return {
      ...item,
      relevancia: Number(puntaje.toFixed(2)),
      resaltado: resaltar(item, consulta, config, campos, coincidencia),
    };
  });

  return {
    data,
    busqueda: {
      q: consulta ? consulta.original : null,
      terminos: consulta
        ? [...consulta.positivos, ...consulta.negativos].map(({ tipo, texto, excluir }) => ({ tipo, texto, excluir }))
        : [],
      campos,
      modo,
      coincidencia,
      orden: ordenAplicado,
    },
    paginacion: { pagina, limite, total, totalPaginas },
  };
}

export function sugerir(candidatos, query) {
  const errores = [];
  const permitidos = ['q', 'limite'];
  for (const [clave, valor] of Object.entries(query)) {
    if (!permitidos.includes(clave)) errores.push({ campo: clave, mensaje: 'parametro no permitido' });
    else if (typeof valor !== 'string') errores.push({ campo: clave, mensaje: 'no puede repetirse ni enviarse como objeto' });
  }

  const q = typeof query.q === 'string' ? limpiar(query.q) : '';
  if (typeof query.q !== 'string') errores.push({ campo: 'q', mensaje: 'q es obligatorio' });
  else if (q.length < 2 || q.length > 40) errores.push({ campo: 'q', mensaje: 'q debe tener entre 2 y 40 caracteres utiles' });

  const limite = typeof query.limite === 'string' ? query.limite.trim() : '5';
  if (!/^\d+$/.test(limite) || Number(limite) < 1 || Number(limite) > 10) {
    errores.push({ campo: 'limite', mensaje: 'limite debe ser un entero entre 1 y 10' });
  }

  if (errores.length) {
    throw new ValidationError('Parametros de sugerencia invalidos', errores, 'BUSQUEDA_INVALIDA');
  }

  const encontrados = [];
  for (const candidato of candidatos) {
    const limpio = limpiar(candidato.texto);
    if (limpio.startsWith(q)) encontrados.push({ ...candidato, rango: 0 });
    else if (limpio.split(' ').some((palabra) => palabra.startsWith(q))) encontrados.push({ ...candidato, rango: 1 });
  }

  encontrados.sort((a, b) =>
    a.rango - b.rango || a.orden - b.orden || collator.compare(a.texto, b.texto));

  return {
    q,
    sugerencias: encontrados.slice(0, Number(limite)).map(({ texto, tipo }) => ({ texto, tipo })),
  };
}
