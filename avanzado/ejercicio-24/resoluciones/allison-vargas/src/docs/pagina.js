const ENTIDADES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
const e = (texto) => String(texto ?? '').replace(/[&<>"']/g, (c) => ENTIDADES[c]);
const METODOS = ['get', 'post', 'put', 'patch', 'delete'];

const nombreRef = (esquema) => (esquema?.$ref ? esquema.$ref.split('/').at(-1) : null);

function operacion(ruta, metodo, op, parametrosComunes) {
  const parametros = [...(parametrosComunes ?? []), ...(op.parameters ?? [])];
  const cuerpo = op.requestBody?.content?.['application/json'];
  const filas = parametros.map((p) => `<li><code>${e(p.name)}</code> (${e(p.in)}${p.required ? ', obligatorio' : ''})${p.description ? ` - ${e(p.description)}` : ''}</li>`).join('');
  const respuestas = Object.entries(op.responses).map(([codigo, r]) => `<li><b>${e(codigo)}</b> ${e(r.description ?? nombreRef(r))}</li>`).join('');
  const ejemplo = cuerpo?.examples?.basico?.value;
  return `<section>
<h3><span class="m ${metodo}">${metodo.toUpperCase()}</span> <code>${e(ruta)}</code></h3>
<p>${e(op.summary)}</p>${op.description ? `<p>${e(op.description)}</p>` : ''}
${filas ? `<h4>Parametros</h4><ul>${filas}</ul>` : ''}
${cuerpo ? `<h4>Body</h4><p><code>${e(nombreRef(cuerpo.schema))}</code></p>${ejemplo ? `<pre>${e(JSON.stringify(ejemplo, null, 2))}</pre>` : ''}` : ''}
<h4>Respuestas</h4><ul>${respuestas}</ul>
</section>`;
}

// documentacion legible generada desde la misma especificacion (sin depender de un CDN)
export function paginaDocs(spec) {
  const secciones = spec.tags.map((tag) => {
    const ops = [];
    for (const [ruta, item] of Object.entries(spec.paths)) {
      for (const metodo of METODOS) {
        if (item[metodo]?.tags?.includes(tag.name)) ops.push(operacion(ruta, metodo, item[metodo], item.parameters));
      }
    }
    return `<h2>${e(tag.name)}</h2><p>${e(tag.description)}</p>${ops.join('')}`;
  }).join('');
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${e(spec.info.title)}</title>
<style>
body{font-family:system-ui,sans-serif;max-width:56rem;margin:2rem auto;padding:0 1rem;line-height:1.5}
section{border:1px solid #ccc;border-radius:6px;padding:.5rem 1rem;margin:1rem 0}
.m{display:inline-block;min-width:4rem;text-align:center;border-radius:4px;color:#fff;font-size:.8rem;padding:.1rem .3rem}
.get{background:#2f6fb3}.post{background:#2e8b57}.delete{background:#b33a3a}.put,.patch{background:#a86b00}
pre{background:#f4f4f4;padding:.5rem;overflow:auto}
</style>
</head>
<body>
<h1>${e(spec.info.title)} <small>v${e(spec.info.version)}</small></h1>
${spec.info.description.split('\n\n').map((p) => `<p>${e(p)}</p>`).join('')}
<p>Servidor: <code>${e(spec.servers[0].url)}</code> - especificacion: <a href="openapi.json">openapi.json</a></p>
${secciones}
</body>
</html>`;
}
