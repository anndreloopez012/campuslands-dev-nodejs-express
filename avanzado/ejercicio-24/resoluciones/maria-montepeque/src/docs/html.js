// pagina de documentacion hecha a mano a partir del OpenAPI (sin swagger-ui)

const escapar = (texto) => String(texto).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

export function paginaDocs(spec) {
    const operaciones = [];
    for (const [ruta, metodos] of Object.entries(spec.paths)) {
        for (const [metodo, op] of Object.entries(metodos)) {
            const parametros = (op.parameters ?? []).map((p) => `<li><code>${escapar(p.name)}</code> (${p.in}${p.required ? ", obligatorio" : ""}) ${escapar(p.description ?? "")}</li>`).join("");
            const ejemplo = op.requestBody?.content?.["application/json"]?.example;
            const respuestas = Object.entries(op.responses).map(([status, r]) => `<li><strong>${status}</strong> ${escapar(r.description)}</li>`).join("");
            operaciones.push(`
    <section>
      <h3><span class="metodo ${metodo}">${metodo.toUpperCase()}</span> <code>${escapar(ruta)}</code></h3>
      <p>${escapar(op.summary)}</p>
      ${parametros ? `<h4>Parametros</h4><ul>${parametros}</ul>` : ""}
      ${ejemplo ? `<h4>Body de ejemplo</h4><pre>${escapar(JSON.stringify(ejemplo, null, 2))}</pre>` : ""}
      <h4>Respuestas</h4><ul>${respuestas}</ul>
    </section>`);
        }
    }

    return `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapar(spec.info.title)}</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 860px; margin: 2rem auto; padding: 0 1rem; color: #222; }
    section { border: 1px solid #ddd; border-radius: 8px; padding: 0.5rem 1rem; margin: 1rem 0; }
    .metodo { color: #fff; padding: 2px 8px; border-radius: 4px; font-size: 0.85rem; }
    .get { background: #2b7bb9; } .post { background: #2e9d5b; }
    pre { background: #f5f5f5; padding: 0.5rem; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${escapar(spec.info.title)} <small>v${escapar(spec.info.version)}</small></h1>
  <p>${escapar(spec.info.description)}</p>
  <p>El JSON completo esta en <a href="/openapi.json">/openapi.json</a> (se puede abrir en editor.swagger.io).</p>
  ${operaciones.join("\n")}
</body>
</html>`;
}
