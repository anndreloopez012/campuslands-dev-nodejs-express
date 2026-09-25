const ANIO_MINIMO = 1450; // imprenta de Gutenberg, como piso razonable
const ANIO_MAXIMO = new Date().getFullYear();

export function validarLibro(datos = {}) {
  const errores = [];
  const { titulo, autor, anio_publicacion, paginas } = datos;

  if (typeof titulo !== 'string' || titulo.trim().length === 0) {
    errores.push('titulo es obligatorio y debe ser un texto no vacio');
  } else if (titulo.length > 120) {
    errores.push('titulo no puede tener mas de 120 caracteres');
  }

  if (typeof autor !== 'string' || autor.trim().length === 0) {
    errores.push('autor es obligatorio y debe ser un texto no vacio');
  }

  if (
    typeof anio_publicacion !== 'number' ||
    !Number.isInteger(anio_publicacion) ||
    anio_publicacion < ANIO_MINIMO ||
    anio_publicacion > ANIO_MAXIMO
  ) {
    errores.push(
      `anio_publicacion es obligatorio y debe ser un numero entero entre ${ANIO_MINIMO} y ${ANIO_MAXIMO}`
    );
  }

  if (paginas !== undefined && paginas !== null) {
    if (!Number.isInteger(paginas) || paginas <= 0) {
      errores.push('paginas, si se envia, debe ser un numero entero positivo');
    }
  }

  return { valido: errores.length === 0, errores };
}
