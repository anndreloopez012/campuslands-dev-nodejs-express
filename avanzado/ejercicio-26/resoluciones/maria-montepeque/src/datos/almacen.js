// "base de datos" en memoria del torneo de shooters
// tablas: equipos, jugadores, partidas

export function crearAlmacen() {
    const tablas = { equipos: new Map(), jugadores: new Map(), partidas: new Map() };
    const contadores = { equipos: 1, jugadores: 1, partidas: 1 };

    function insertar(tabla, fila) {
        // si la fila ya trae id (por ejemplo desde un fixture) se respeta
        const id = fila.id ?? contadores[tabla];
        if (tablas[tabla].has(id)) throw new Error(`Ya existe ${tabla} con id ${id}`);
        contadores[tabla] = Math.max(contadores[tabla], id + 1);
        const guardada = { ...fila, id };
        tablas[tabla].set(id, guardada);
        return guardada;
    }

    return {
        insertar,
        buscar: (tabla, id) => tablas[tabla].get(id) ?? null,
        listar: (tabla) => [...tablas[tabla].values()],
        actualizar: (tabla, id, cambios) => Object.assign(tablas[tabla].get(id), cambios),
        contar: (tabla) => tablas[tabla].size
    };
}
