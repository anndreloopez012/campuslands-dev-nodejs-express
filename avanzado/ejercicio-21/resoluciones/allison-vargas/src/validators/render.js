import {
  esObjetoPlano, exigirCuerpo, leerEntero, leerOpcion, leerTexto, rechazarSobrantes, terminar,
} from './comunes.js';

export const CALIDADES = Object.freeze(['borrador', 'final']);

export function validarEscena(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['nombre', 'luces', 'objetos'], errores);
  const datos = {
    nombre: leerTexto(cuerpo, 'nombre', errores, { min: 3, max: 60 }),
    luces: leerEntero(cuerpo, 'luces', errores, { min: 0, max: 64 }),
    objetos: [],
  };
  if (!Array.isArray(cuerpo.objetos) || cuerpo.objetos.length === 0 || cuerpo.objetos.length > 50) {
    errores.push({ campo: 'objetos', mensaje: 'debe ser una lista de 1 a 50 objetos' });
  } else {
    cuerpo.objetos.forEach((o, i) => {
      const prefijo = `objetos[${i}]`;
      if (!esObjetoPlano(o)) {
        errores.push({ campo: prefijo, mensaje: 'debe ser un objeto' });
        return;
      }
      rechazarSobrantes(o, ['nombre', 'poligonos'], errores, prefijo);
      datos.objetos.push({
        nombre: leerTexto(o, 'nombre', errores, { max: 40, prefijo }),
        poligonos: leerEntero(o, 'poligonos', errores, { min: 1, max: 5_000_000, prefijo }),
      });
    });
  }
  return terminar(errores, datos);
}

export function validarRender(cuerpo) {
  const errores = [];
  if (!exigirCuerpo(cuerpo, errores)) return terminar(errores);
  rechazarSobrantes(cuerpo, ['escenaId', 'calidad', 'frames'], errores);
  return terminar(errores, {
    escenaId: leerEntero(cuerpo, 'escenaId', errores, { min: 1 }),
    calidad: leerOpcion(cuerpo, 'calidad', CALIDADES, errores, { requerido: false }) ?? 'borrador',
    frames: leerEntero(cuerpo, 'frames', errores, { min: 1, max: 240 }),
  });
}
