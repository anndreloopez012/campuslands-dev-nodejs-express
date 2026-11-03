export function validarAceptarMision(params, body) {
  const errores = [];
  const misionId = Number(params.id);
  const personajeId = Number(body?.personajeId);

  if (!Number.isInteger(misionId) || misionId <= 0) errores.push('El id de la mision debe ser un entero positivo');
  if (!Number.isInteger(personajeId) || personajeId <= 0) errores.push('personajeId es obligatorio y debe ser un entero positivo');

  return { valido: errores.length === 0, errores, misionId, personajeId };
}
