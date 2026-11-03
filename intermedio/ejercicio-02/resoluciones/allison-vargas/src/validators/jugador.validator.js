export const RANGOS = ['hierro', 'bronce', 'plata', 'oro', 'platino', 'diamante'];

export function validarJugador(body) {
  const errores = [];
  const nick = typeof body?.nick === 'string' ? body.nick.trim() : '';
  const rango = body?.rango;

  if (nick.length < 3 || nick.length > 16) errores.push('nick debe tener entre 3 y 16 caracteres');
  if (!RANGOS.includes(rango)) errores.push(`rango debe ser uno de: ${RANGOS.join(', ')}`);

  return { valido: errores.length === 0, errores, datos: { nick, rango } };
}
