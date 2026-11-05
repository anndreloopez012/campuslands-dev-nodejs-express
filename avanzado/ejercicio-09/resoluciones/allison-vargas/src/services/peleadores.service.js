import { crear } from '../errores/index.js';
import { paginar } from '../utils/paginacion.js';

export function crearServicioPeleadores({ peleadores }) {
  return {
    listar({ pagina, limite, categoria }) {
      const lista = categoria ? peleadores.filter((p) => p.categoria === categoria) : peleadores;
      return paginar(lista, pagina, limite);
    },
    obtener(id) {
      const peleador = peleadores.find((p) => p.id === id);
      if (!peleador) throw crear('PELEADOR_NO_ENCONTRADO', { peleadorId: id });
      return peleador;
    },
  };
}
