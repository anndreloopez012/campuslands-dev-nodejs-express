const POR_DEFECTO = 'http://localhost:5173,http://localhost:3000,https://lienzo.dibujo.test';

function leerOrigenes(texto) {
  const origenes = texto.split(',').map((item) => item.trim().replace(/\/+$/, '')).filter(Boolean);
  const errores = [];

  origenes.forEach((origen) => {
    try {
      const url = new URL(origen);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== origen) errores.push(origen);
    } catch {
      errores.push(origen);
    }
  });

  if (!origenes.length) errores.push('(lista vacia)');
  if (errores.length) {
    console.error(`ORIGENES_PERMITIDOS invalido: ${errores.join(', ')}`);
    console.error('Usa origenes completos separados por coma, por ejemplo http://localhost:5173');
    process.exit(1);
  }

  return [...new Set(origenes)];
}

export const origenesPermitidos = Object.freeze(leerOrigenes(process.env.ORIGENES_PERMITIDOS ?? POR_DEFECTO));

export const politicas = Object.freeze({
  publica: Object.freeze({
    origenes: '*',
    metodos: ['GET', 'HEAD'],
    cabeceras: [],
    expuestas: ['X-Total-Count'],
    credenciales: false,
    maxAge: 600,
  }),
  restringida: Object.freeze({
    origenes: origenesPermitidos,
    metodos: ['GET', 'POST', 'PATCH', 'DELETE'],
    cabeceras: ['content-type', 'x-cliente'],
    expuestas: ['X-Total-Count', 'Location'],
    credenciales: true,
    maxAge: 600,
  }),
});
