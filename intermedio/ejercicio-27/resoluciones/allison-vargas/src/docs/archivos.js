import { construirOpenApi } from './openapi.js';
import { renderizarMarkdown } from './markdown.js';

export function generarArchivos() {
  const spec = construirOpenApi();
  return {
    'openapi.json': `${JSON.stringify(spec, null, 2)}\n`,
    'API.md': renderizarMarkdown(spec),
  };
}
