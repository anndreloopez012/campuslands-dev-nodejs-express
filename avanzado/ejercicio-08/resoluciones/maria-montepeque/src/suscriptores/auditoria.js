// la auditoria escucha "*": guarda todos los eventos en orden
export function registrarAuditoria(bus) {
    const registro = [];
    bus.suscribir("*", "auditoria", (mensaje) => {
        registro.push(mensaje);
    });
    return { registro: (filtro = {}) => registro.filter((m) => !filtro.pedidoId || m.datos.pedidoId === filtro.pedidoId) };
}
