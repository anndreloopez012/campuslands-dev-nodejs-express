// antes cada ruta tenia su propio for para buscar por id
// ahora equipos y partidos usan la misma "coleccion" en memoria
export function crearColeccion(iniciales) {
    const items = iniciales.map((item) => ({ ...item }));
    let ultimoId = items.reduce((max, item) => Math.max(max, item.id), 0);

    return {
        listar(filtro = () => true) {
            return items.filter(filtro);
        },
        buscar(id) {
            return items.find((item) => item.id === id) || null;
        },
        existe(condicion) {
            return items.some(condicion);
        },
        agregar(datos) {
            const nuevo = { id: ++ultimoId, ...datos };
            items.push(nuevo);
            return nuevo;
        },
        quitar(id) {
            const pos = items.findIndex((item) => item.id === id);
            if (pos !== -1) items.splice(pos, 1);
        }
    };
}
