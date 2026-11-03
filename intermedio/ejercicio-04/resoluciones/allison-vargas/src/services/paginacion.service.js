import { AppError } from '../utils/AppError.js';

const LIMITE_POR_DEFECTO = 10;
const LIMITE_MAXIMO = 50;

function entero(valor, porDefecto, nombre) {
  if (valor === undefined) return porDefecto;
  const numero = Number(valor);
  if (!Number.isInteger(numero) || numero <= 0) {
    throw new AppError(`${nombre} debe ser un entero positivo`, 400);
  }
  return numero;
}

export function paginar(items, query = {}) {
  const pagina = entero(query.pagina, 1, 'pagina');
  const limite = entero(query.limite, LIMITE_POR_DEFECTO, 'limite');
  if (limite > LIMITE_MAXIMO) {
    throw new AppError(`limite no puede ser mayor a ${LIMITE_MAXIMO}`, 400);
  }

  const total = items.length;
  const inicio = (pagina - 1) * limite;

  return {
    data: items.slice(inicio, inicio + limite),
    paginacion: { pagina, limite, total, totalPaginas: Math.ceil(total / limite) },
  };
}
