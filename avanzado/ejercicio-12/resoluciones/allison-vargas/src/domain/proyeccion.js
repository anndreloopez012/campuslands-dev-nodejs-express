import { CAMPOS_BASE, CAMPOS_INCLUIDOS } from '../constants/peliculas.js';

const redondear = (n) => Math.round(n * 100) / 100;

export function camposPorDefecto(incluir) {
  return [...Object.keys(CAMPOS_BASE), ...incluir];
}

export function proyectar(pelicula, campos, incluir, catalogo) {
  const disponibles = { ...pelicula };
  if (incluir.includes('director')) {
    const d = catalogo.director(pelicula.directorId);
    disponibles.director = d ? { id: d.id, nombre: d.nombre, pais: d.pais } : null;
  }
  if (incluir.includes('reparto')) {
    disponibles.reparto = pelicula.repartoIds.map((id) => catalogo.actor(id)).filter(Boolean).map((a) => ({ id: a.id, nombre: a.nombre }));
  }
  if (incluir.includes('ganancia')) disponibles.ganancia = redondear(pelicula.recaudacionMusd - pelicula.presupuestoMusd);
  const salida = {};
  for (const campo of campos) salida[campo] = disponibles[campo];
  return salida;
}

export function esquemaDe(campos) {
  const definiciones = { ...CAMPOS_BASE, ...CAMPOS_INCLUIDOS };
  const properties = {};
  for (const campo of campos) properties[campo] = definiciones[campo];
  return {
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    title: 'Pelicula de miedo',
    type: 'object',
    properties,
    required: [...campos],
    additionalProperties: false,
  };
}
