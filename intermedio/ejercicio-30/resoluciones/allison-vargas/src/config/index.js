export function leerConfig(env = process.env) {
  const duracion = Number(env.TOKEN_TTL_SEG);
  return {
    secretoToken: env.TOKEN_SECRET || 'secreto-de-desarrollo-solo-para-pruebas',
    duracionTokenSeg: Number.isInteger(duracion) && duracion > 0 ? duracion : 3600,
  };
}
