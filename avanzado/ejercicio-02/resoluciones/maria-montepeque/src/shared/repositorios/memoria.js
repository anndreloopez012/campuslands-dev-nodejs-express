// repositorio en memoria
// todas las funciones son async aunque no hace falta,
// asi tiene la misma forma que el de archivo (o una base de datos despues)
export function crearRepoMemoria(iniciales = []) {
    let items = structuredClone(iniciales);

    return {
        async listar(filtro = () => true) {
            return structuredClone(items.filter(filtro));
        },
        async buscar(id) {
            const item = items.find((i) => i.id === id);
            return item ? structuredClone(item) : null;
        },
        async crear(datos) {
            const nuevo = { id: Math.max(0, ...items.map((i) => i.id)) + 1, ...datos };
            items.push(nuevo);
            return structuredClone(nuevo);
        },
        async actualizar(id, cambios) {
            const item = items.find((i) => i.id === id);
            if (!item) return null;
            Object.assign(item, cambios);
            return structuredClone(item);
        }
    };
}
