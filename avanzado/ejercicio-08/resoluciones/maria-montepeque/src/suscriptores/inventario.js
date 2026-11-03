// el inventario escucha los pedidos y reserva o libera unidades
// cuando decide, publica su propio evento (confirmado / rechazado)

const STOCK_INICIAL = {
    "Bugatti Chiron": 2,
    "Koenigsegg Jesko": 1,
    "Pagani Utopia": 1,
    "McLaren W1": 3,
    "Rimac Nevera": 0
};

export function registrarInventario(bus) {
    const stock = { ...STOCK_INICIAL };

    bus.suscribir("pedido.creado", "inventario", ({ datos }) => {
        if (stock[datos.modelo] > 0) {
            stock[datos.modelo]--;
            bus.publicar("pedido.confirmado", { pedidoId: datos.pedidoId, modelo: datos.modelo, email: datos.email });
        } else {
            bus.publicar("pedido.rechazado", { pedidoId: datos.pedidoId, modelo: datos.modelo, email: datos.email, motivo: `No hay unidades de ${datos.modelo}` });
        }
    });

    bus.suscribir("pedido.cancelado", "inventario", ({ datos }) => {
        if (datos.liberarUnidad) stock[datos.modelo]++;
    });

    return { stock: () => ({ ...stock }) };
}
