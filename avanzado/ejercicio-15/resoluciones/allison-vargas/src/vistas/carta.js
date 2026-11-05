const ENTIDADES = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;',
};

export const escaparHtml = (texto) => String(texto).replace(/[&<>"'`]/g, (c) => ENTIDADES[c]);

const pesos = (valor) => `$${valor.toLocaleString('es-CL')}`;

export function paginaCarta(puesto, resenas, nonce) {
  const platos = puesto.platos
    .map((p) => `<li><span>${escaparHtml(p.nombre)}</span><b>${pesos(p.precio)}</b></li>`)
    .join('');
  const opiniones = resenas.length
    ? resenas.map((r) => `<li><b>${escaparHtml(r.autor)}</b> ${'*'.repeat(r.estrellas)}<p>${escaparHtml(r.texto)}</p></li>`).join('')
    : '<li>Todavia no hay resenas.</li>';
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escaparHtml(puesto.nombre)}</title>
<style nonce="${nonce}">
  body { font-family: system-ui, sans-serif; max-width: 40rem; margin: 2rem auto; padding: 0 1rem; }
  li { display: flex; justify-content: space-between; gap: 1rem; padding: .25rem 0; }
  .resenas li { display: block; }
</style>
</head>
<body>
<h1>${escaparHtml(puesto.nombre)}</h1>
<p>${escaparHtml(puesto.tipo)} en ${escaparHtml(puesto.barrio)}</p>
<h2>Carta</h2>
<ul>${platos}</ul>
<h2>Resenas</h2>
<ul class="resenas">${opiniones}</ul>
<p id="hora"></p>
<script nonce="${nonce}">
  document.getElementById('hora').textContent = 'Consultado a las ' + new Date().toLocaleTimeString();
</script>
</body>
</html>`;
}
