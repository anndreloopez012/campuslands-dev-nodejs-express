export function paginar(items, pagina, limite) {
  const total = items.length;
  const totalPaginas = Math.max(1, Math.ceil(total / limite));
  const inicio = (pagina - 1) * limite;
  return {
    data: items.slice(inicio, inicio + limite),
    paginacion: { pagina, limite, total, totalPaginas },
  };
}
