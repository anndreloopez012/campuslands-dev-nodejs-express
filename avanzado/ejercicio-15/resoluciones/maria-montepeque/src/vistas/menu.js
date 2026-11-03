// escapar HTML: convierte los caracteres especiales para que se muestren como texto
// sin esto, un plato llamado <script>...</script> se ejecutaria en el navegador del cliente
export function escaparHtml(texto) {
    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

export function paginaMenu(platos, nonce) {
    const filas = platos
        .map((p) => `<li><strong>${escaparHtml(p.nombre)}</strong> - Q${p.precio} <em>${escaparHtml(p.puesto)}</em></li>`)
        .join("\n        ");

    return `<!doctype html>
<html lang="es">
<head>
    <meta charset="utf-8">
    <title>Menu - Comida urbana</title>
</head>
<body>
    <h1>Menu del dia</h1>
    <ul>
        ${filas}
    </ul>
    <p id="hora"></p>
    <script nonce="${nonce}">
        document.getElementById("hora").textContent = "Actualizado: " + new Date().toLocaleTimeString();
    </script>
</body>
</html>`;
}
