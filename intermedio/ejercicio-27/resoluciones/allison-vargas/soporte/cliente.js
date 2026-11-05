import { crearApp } from '../src/app.js';
import { BASE_RUTAS } from '../src/constants/rutas.js';

export async function levantar(app = crearApp()) {
  const servidor = await new Promise((resolver) => {
    const escuchando = app.listen(0, () => resolver(escuchando));
  });
  const origen = `http://127.0.0.1:${servidor.address().port}`;

  async function leer(url, opciones = {}) {
    const respuesta = await fetch(url, opciones);
    const texto = await respuesta.text();
    let cuerpo = null;
    if (texto) {
      try {
        cuerpo = JSON.parse(texto);
      } catch {
        cuerpo = texto;
      }
    }
    return { respuesta, status: respuesta.status, cabeceras: respuesta.headers, cuerpo };
  }

  return {
    origen,
    pedir: (ruta, opciones) => leer(`${origen}${BASE_RUTAS}${ruta}`, opciones),
    absoluta: (ruta, opciones) => leer(`${origen}${ruta}`, opciones),
    json: (ruta, cuerpo, metodo = 'POST') => leer(`${origen}${BASE_RUTAS}${ruta}`, {
      method: metodo,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(cuerpo),
    }),
    cerrar: () => new Promise((resolver) => {
      servidor.closeAllConnections();
      servidor.close(resolver);
    }),
  };
}
