export function crearTablaDePuntajes() {
  const filas = new Map();

  return {
    tiene: (jugadorId) => filas.has(jugadorId),
    obtener: (jugadorId) => {
      const fila = filas.get(jugadorId);
      return fila ? { ...fila } : null;
    },
    guardar: (jugadorId, fila) => {
      filas.set(jugadorId, { ...fila });
    },
    todos: () => [...filas.entries()].map(([jugadorId, fila]) => ({ jugadorId, ...fila })),
  };
}
