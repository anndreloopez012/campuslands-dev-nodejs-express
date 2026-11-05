const POR_DEFECTO = 600;

function leerTtl() {
  const texto = process.env.SUBIDA_TTL_SEG;
  if (texto === undefined || texto === '') return POR_DEFECTO;
  const valor = Number(texto);
  if (!Number.isInteger(valor) || valor < 1 || valor > 86400) {
    console.error(`SUBIDA_TTL_SEG invalido: "${texto}". Debe ser un entero entre 1 y 86400`);
    process.exit(1);
  }
  return valor;
}

export const ttlSubidaSeg = leerTtl();
