import { describirOperaciones } from './modelo.js';

const escapar = (valor) => String(valor)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const ESTILOS = `
:root{--fondo:#fafaf8;--texto:#1c1c1a;--suave:#6b6b66;--borde:#dcdcd6;--tarjeta:#fff;--codigo:#f0f0ec;--acento:#2f5d8a}
@media (prefers-color-scheme:dark){:root{--fondo:#161616;--texto:#ecece8;--suave:#a0a09a;--borde:#34342f;--tarjeta:#1f1f1d;--codigo:#262623;--acento:#8fb7de}}
*{box-sizing:border-box}
body{margin:0;background:var(--fondo);color:var(--texto);font:16px/1.55 system-ui,sans-serif}
main{max-width:860px;margin:0 auto;padding:24px 16px 64px}
h1{font-size:1.8rem;margin:0 0 4px}
h2{font-size:1.3rem;margin:40px 0 8px;border-bottom:1px solid var(--borde);padding-bottom:6px}
h3{font-size:1.05rem;margin:0 0 6px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
p{margin:6px 0}
.suave{color:var(--suave)}
nav ul{list-style:none;padding:0;margin:16px 0;display:flex;flex-wrap:wrap;gap:6px 14px}
a{color:var(--acento)}
section.op{background:var(--tarjeta);border:1px solid var(--borde);border-radius:8px;padding:14px 16px;margin:14px 0}
.metodo{font:600 .75rem/1 ui-monospace,monospace;padding:4px 7px;border-radius:4px;background:var(--acento);color:var(--fondo)}
.metodo.post{background:#2e7d4f;color:#fff}.metodo.patch{background:#a66a00;color:#fff}.metodo.delete{background:#b3372f;color:#fff}
code,pre{font-family:ui-monospace,monospace;font-size:.85rem}
code{background:var(--codigo);padding:1px 5px;border-radius:4px}
pre{background:var(--codigo);padding:10px 12px;border-radius:6px;overflow-x:auto;margin:6px 0}
pre code{padding:0;background:none}
table{width:100%;border-collapse:collapse;margin:6px 0;font-size:.9rem}
th,td{text-align:left;padding:5px 8px;border-bottom:1px solid var(--borde);vertical-align:top}
th{color:var(--suave);font-weight:600}
h4{margin:14px 0 2px;font-size:.85rem;text-transform:uppercase;letter-spacing:.04em;color:var(--suave)}
`;

function tablaParametros(parametros) {
  if (!parametros.length) return '';
  const filas = parametros.map((p) => `<tr><td><code>${escapar(p.nombre)}</code></td><td>${escapar(p.en === 'path' ? 'ruta' : 'consulta')}</td><td>${escapar(p.tipo)}</td><td>${p.requerido ? 'si' : 'no'}</td><td>${escapar(p.descripcion)}</td></tr>`).join('');
  return `<h4>Parametros</h4><table><tr><th>Nombre</th><th>En</th><th>Tipo</th><th>Obligatorio</th><th>Descripcion</th></tr>${filas}</table>`;
}

function tablaCuerpo(cuerpo) {
  if (!cuerpo) return '';
  const filas = cuerpo.campos.map((c) => `<tr><td><code>${escapar(c.nombre)}</code></td><td>${escapar(c.tipo)}</td><td>${c.requerido ? 'si' : 'no'}</td><td>${escapar(c.descripcion)}</td></tr>`).join('');
  return `<h4>Body JSON</h4><p class="suave">${escapar(cuerpo.descripcion)}</p><table><tr><th>Campo</th><th>Tipo</th><th>Obligatorio</th><th>Descripcion</th></tr>${filas}</table><pre><code>${escapar(JSON.stringify(cuerpo.ejemplo, null, 2))}</code></pre>`;
}

function bloqueRespuestas(respuestas) {
  const items = respuestas.map((r) => {
    const cabeceras = r.cabeceras.length ? ` <span class="suave">Headers: ${r.cabeceras.map((h) => `<code>${escapar(h)}</code>`).join(', ')}</span>` : '';
    const ejemplo = r.ejemplo === undefined ? '' : `<pre><code>${escapar(JSON.stringify(r.ejemplo, null, 2))}</code></pre>`;
    return `<p><strong>${escapar(r.codigo)}</strong> ${escapar(r.descripcion)}${cabeceras}</p>${ejemplo}`;
  }).join('');
  return `<h4>Respuestas</h4>${items}`;
}

export function renderizarHtml(spec) {
  const operaciones = describirOperaciones(spec);
  const secciones = spec.tags.map((tag) => {
    const delTag = operaciones.filter((op) => op.tag === tag.name);
    if (!delTag.length) return '';
    const bloques = delTag.map((op) => `
<section class="op" id="${escapar(op.id)}">
<h3><span class="metodo ${op.metodo.toLowerCase()}">${op.metodo}</span><code>${escapar(op.ruta)}</code></h3>
<p><strong>${escapar(op.resumen)}</strong></p>
${op.descripcion ? `<p class="suave">${escapar(op.descripcion)}</p>` : ''}
${tablaParametros(op.parametros)}
${tablaCuerpo(op.cuerpo)}
${bloqueRespuestas(op.respuestas)}
<h4>Ejemplo</h4>
<pre><code>${escapar(op.curl)}</code></pre>
</section>`).join('');
    return `<h2 id="tag-${escapar(tag.name)}">${escapar(tag.name)}</h2><p class="suave">${escapar(tag.description)}</p>${bloques}`;
  }).join('');

  const indice = spec.tags.map((tag) => `<li><a href="#tag-${escapar(tag.name)}">${escapar(tag.name)}</a></li>`).join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapar(spec.info.title)}</title>
<style>${ESTILOS}</style>
</head>
<body>
<main>
<h1>${escapar(spec.info.title)}</h1>
<p class="suave">Version ${escapar(spec.info.version)}. Base: <code>${escapar(spec.servers[0].url)}</code>. Especificacion: <a href="${escapar(spec.servers[0].url)}/docs/openapi.json">openapi.json</a></p>
<p>${escapar(spec.info.description)}</p>
<nav><ul>${indice}</ul></nav>
${secciones}
</main>
</body>
</html>
`;
}
