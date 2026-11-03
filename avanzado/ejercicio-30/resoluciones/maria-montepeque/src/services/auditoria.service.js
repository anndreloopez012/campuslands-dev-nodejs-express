// historial de todo lo que pasa con las ordenes (solo se agrega)
export function crearAuditoriaService(store, { reloj = () => new Date() } = {}) {
    return {
        anotar(usuario, accion, ordenId, detalle = {}) {
            const entrada = Object.freeze({ fecha: reloj().toISOString(), usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol }, accion, ordenId, detalle });
            store.auditoria.push(entrada);
            return entrada;
        },
        deOrden: (ordenId) => store.auditoria.filter((e) => e.ordenId === ordenId)
    };
}
