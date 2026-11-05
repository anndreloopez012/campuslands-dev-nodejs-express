import { describirOperaciones } from './modelo.js';

const celda = (valor) => String(valor).replaceAll('|', '\\|');

export function renderizarMarkdown(spec) {
  const operaciones = describirOperaciones(spec);
  const lineas = [`# ${spec.info.title}`, '', `Version ${spec.info.version}. Base: \`${spec.servers[0].url}\``, '', spec.info.description, ''];

  for (const tag of spec.tags) {
    const delTag = operaciones.filter((op) => op.tag === tag.name);
    if (!delTag.length) continue;
    lineas.push(`## ${tag.name}`, '', tag.description, '');

    for (const op of delTag) {
      lineas.push(`### ${op.metodo} ${op.ruta}`, '', `**${op.resumen}**`, '');
      if (op.descripcion) lineas.push(op.descripcion, '');

      if (op.parametros.length) {
        lineas.push('Parametros:', '', '| Nombre | En | Tipo | Obligatorio | Descripcion |', '| --- | --- | --- | --- | --- |');
        for (const p of op.parametros) {
          lineas.push(`| \`${p.nombre}\` | ${p.en === 'path' ? 'ruta' : 'consulta'} | ${celda(p.tipo)} | ${p.requerido ? 'si' : 'no'} | ${celda(p.descripcion)} |`);
        }
        lineas.push('');
      }

      if (op.cuerpo) {
        lineas.push('Body JSON:', '', '| Campo | Tipo | Obligatorio | Descripcion |', '| --- | --- | --- | --- |');
        for (const c of op.cuerpo.campos) {
          lineas.push(`| \`${c.nombre}\` | ${celda(c.tipo)} | ${c.requerido ? 'si' : 'no'} | ${celda(c.descripcion)} |`);
        }
        lineas.push('', '```json', JSON.stringify(op.cuerpo.ejemplo, null, 2), '```', '');
      }

      lineas.push('Respuestas:', '');
      for (const r of op.respuestas) {
        const cabeceras = r.cabeceras.length ? ` (headers: ${r.cabeceras.join(', ')})` : '';
        lineas.push(`- \`${r.codigo}\` ${r.descripcion}${cabeceras}`);
      }
      lineas.push('', 'Ejemplo:', '', '```', op.curl, '```', '');
    }
  }
  return `${lineas.join('\n').trimEnd()}\n`;
}
