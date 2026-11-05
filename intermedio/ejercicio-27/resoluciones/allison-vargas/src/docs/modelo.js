const METODOS = ['get', 'post', 'put', 'patch', 'delete'];

export function resolver(spec, nodo) {
  let actual = nodo;
  while (actual && actual.$ref) {
    actual = actual.$ref.replace('#/', '').split('/').reduce((valor, clave) => valor[clave], spec);
  }
  return actual;
}

export function describirTipo(spec, esquema) {
  const s = resolver(spec, esquema);
  if (!s) return '';
  if (s.enum) return `uno de: ${s.enum.join(', ')}`;
  if (s.type === 'string') {
    if (s.format) return `texto (${s.format})`;
    if (s.pattern) return `texto de ${s.minLength} a ${s.maxLength} caracteres, formato ${s.pattern}`;
    if (s.minLength !== undefined) return `texto de ${s.minLength} a ${s.maxLength} caracteres`;
    return 'texto';
  }
  if (s.type === 'integer' || s.type === 'number') {
    const base = s.type === 'integer' ? 'entero' : 'numero';
    if (s.minimum !== undefined && s.maximum !== undefined) return `${base} entre ${s.minimum} y ${s.maximum}`;
    if (s.minimum !== undefined) return `${base} desde ${s.minimum}`;
    return base;
  }
  if (s.type === 'boolean') return 'booleano';
  if (s.type === 'array') return `lista de ${describirTipo(spec, s.items)}`;
  return s.type ?? '';
}

function camposDe(spec, esquema) {
  const s = resolver(spec, esquema);
  const requeridos = s.required ?? [];
  return Object.entries(s.properties ?? {}).map(([nombre, propiedad]) => ({
    nombre,
    tipo: describirTipo(spec, propiedad),
    requerido: requeridos.includes(nombre),
    descripcion: resolver(spec, propiedad).description ?? '',
  }));
}

function rutaConEjemplos(ruta, parametros) {
  return parametros
    .filter((p) => p.en === 'path')
    .reduce((texto, p) => texto.replace(`{${p.nombre}}`, String(p.ejemplo)), ruta);
}

function consultaConEjemplos(parametros) {
  const pares = parametros.filter((p) => p.en === 'query' && p.ejemplo !== undefined && p.nombre !== 'pagina' && p.nombre !== 'limite');
  return pares.length ? `?${pares.map((p) => `${p.nombre}=${p.ejemplo}`).join('&')}` : '';
}

function armarCurl(spec, metodo, ruta, parametros, cuerpo) {
  const base = spec.servers[0].url;
  const url = `http://localhost:3000${base}${rutaConEjemplos(ruta, parametros)}${metodo === 'GET' ? consultaConEjemplos(parametros) : ''}`;
  const partes = ['curl'];
  if (metodo !== 'GET') partes.push(`-X ${metodo}`);
  partes.push(`"${url}"`);
  if (cuerpo) {
    partes.push('-H "Content-Type: application/json"');
    partes.push(`-d '${JSON.stringify(cuerpo.ejemplo)}'`);
  }
  return partes.join(' ');
}

export function describirOperaciones(spec) {
  const operaciones = [];
  for (const [ruta, item] of Object.entries(spec.paths)) {
    for (const metodoMinuscula of METODOS) {
      const op = item[metodoMinuscula];
      if (!op) continue;
      const metodo = metodoMinuscula.toUpperCase();

      const parametros = (op.parameters ?? []).map((p) => {
        const r = resolver(spec, p);
        return {
          nombre: r.name,
          en: r.in,
          requerido: Boolean(r.required),
          tipo: describirTipo(spec, r.schema),
          descripcion: r.description ?? '',
          ejemplo: r.example,
        };
      });

      let cuerpo = null;
      if (op.requestBody) {
        const media = op.requestBody.content['application/json'];
        cuerpo = {
          descripcion: op.requestBody.description ?? '',
          campos: camposDe(spec, media.schema),
          ejemplo: media.example,
        };
      }

      const respuestas = Object.entries(op.responses).map(([codigo, definicion]) => {
        const r = resolver(spec, definicion);
        const tipoContenido = Object.keys(r.content ?? {})[0] ?? null;
        return {
          codigo,
          descripcion: r.description,
          tipoContenido,
          ejemplo: tipoContenido ? r.content[tipoContenido].example : undefined,
          cabeceras: Object.keys(r.headers ?? {}),
        };
      });

      operaciones.push({
        id: op.operationId,
        tag: op.tags[0],
        metodo,
        ruta,
        resumen: op.summary,
        descripcion: op.description ?? '',
        parametros,
        cuerpo,
        respuestas,
        curl: armarCurl(spec, metodo, ruta, parametros, cuerpo),
      });
    }
  }
  return operaciones;
}
