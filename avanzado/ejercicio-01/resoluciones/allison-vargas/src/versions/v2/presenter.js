import { calcularAtributos } from '../../domain/atributos.js';

export const presentarV2 = (personaje) => ({
  id: personaje.id,
  nombre: personaje.nombre,
  clase: personaje.clase,
  nivel: personaje.nivel,
  atributos: calcularAtributos(personaje.clase, personaje.nivel),
  creadoEn: personaje.creadoEn,
});

export function construirEnlaces(req, { pagina, limite, totalPaginas }) {
  const ruta = (numero) => {
    const parametros = new URLSearchParams();
    for (const [clave, valor] of Object.entries(req.query)) {
      if (clave !== 'pagina') parametros.set(clave, valor);
    }
    parametros.set('pagina', String(numero));
    parametros.set('limite', String(limite));
    return `${req.baseUrl}${req.path}?${parametros.toString()}`;
  };
  return {
    self: ruta(pagina),
    first: ruta(1),
    prev: pagina > 1 ? ruta(pagina - 1) : null,
    next: pagina < totalPaginas ? ruta(pagina + 1) : null,
    last: ruta(totalPaginas),
  };
}
