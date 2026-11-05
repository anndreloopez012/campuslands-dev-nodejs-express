import { crear } from '../errores/index.js';
import { crearSingleFlight } from '../concurrencia/semaforo.js';
import { validarEscena } from '../validators/render.js';

export const etiquetaDe = (escena) => `"v${escena.version}"`;

export function crearServicioEscenas({ escenas: base, reloj, demoraVistaPreviaMs = 30 }) {
  const escenas = new Map(structuredClone(base).map((e) => [e.id, { ...e, version: 1 }]));
  const unaVez = crearSingleFlight();
  let calculos = 0;
  let siguienteId = Math.max(0, ...escenas.keys()) + 1;

  function escena(id) {
    const encontrada = escenas.get(id);
    if (!encontrada) throw crear('ESCENA_NO_ENCONTRADA', { escenaId: id });
    return encontrada;
  }

  return {
    listar: () => [...escenas.values()],
    obtener: (id) => ({ ...escena(id) }),

    crear(cuerpo) {
      const nueva = {
        id: siguienteId, ...validarEscena(cuerpo), version: 1, actualizadaEn: reloj().toISOString(),
      };
      siguienteId += 1;
      escenas.set(nueva.id, nueva);
      return { ...nueva };
    },

    // concurrencia optimista: solo se guarda si el cliente edito la ultima version que existe
    reemplazar(id, cuerpo, siCoincide) {
      const actual = escena(id);
      if (siCoincide === undefined) throw crear('PRECONDICION_REQUERIDA');
      if (siCoincide !== '*' && !siCoincide.split(',').map((v) => v.trim()).includes(etiquetaDe(actual))) {
        throw crear('CONFLICTO_DE_VERSION', { actual: actual.version }, { cabeceras: { ETag: etiquetaDe(actual) } });
      }
      const nueva = {
        id, ...validarEscena(cuerpo), version: actual.version + 1, actualizadaEn: reloj().toISOString(),
      };
      escenas.set(id, nueva);
      return { ...nueva };
    },

    // muchas peticiones simultaneas de la misma version comparten un unico calculo
    async vistaPrevia(id) {
      const actual = escena(id);
      return unaVez(`${id}:${actual.version}`, async () => {
        calculos += 1;
        await new Promise((r) => { setTimeout(r, demoraVistaPreviaMs); });
        return {
          escenaId: id,
          version: actual.version,
          poligonos: actual.objetos.reduce((t, o) => t + o.poligonos, 0),
          luces: actual.luces,
        };
      });
    },

    get calculos() { return calculos; },
  };
}
