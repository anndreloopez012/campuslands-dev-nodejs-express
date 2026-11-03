// el servicio de pedidos solo cambia estados y PUBLICA eventos
// no llama al inventario ni manda correos: eso lo hacen los suscriptores

class ErrorPedido extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status;
    }
}

// que estado sigue y que evento se publica al avanzar
const AVANCES = {
    confirmado: { siguiente: "en_produccion", evento: "pedido.en_produccion" },
    en_produccion: { siguiente: "entregado", evento: "pedido.entregado" }
};

export const MODELOS = ["Bugatti Chiron", "Koenigsegg Jesko", "Pagani Utopia", "McLaren W1", "Rimac Nevera"];

export function crearPedidosServicio(bus) {
    const pedidos = new Map();
    let siguienteId = 1;

    // el servicio tambien escucha: cuando el inventario confirma o rechaza, cambio el estado
    bus.suscribir("pedido.confirmado", "pedidos", ({ datos }) => {
        pedidos.get(datos.pedidoId).estado = "confirmado";
    });
    bus.suscribir("pedido.rechazado", "pedidos", ({ datos }) => {
        const pedido = pedidos.get(datos.pedidoId);
        pedido.estado = "rechazado";
        pedido.motivo = datos.motivo;
    });

    function crear(body = {}) {
        const errores = [];
        if (!MODELOS.includes(body.modelo)) errores.push(`modelo debe ser uno de: ${MODELOS.join(", ")}`);
        if (typeof body.cliente !== "string" || body.cliente.trim().length < 3) errores.push("cliente es obligatorio");
        if (typeof body.email !== "string" || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(body.email)) errores.push("email no es valido");
        if (errores.length > 0) {
            throw Object.assign(new ErrorPedido(400, "Datos invalidos"), { errores });
        }

        const pedido = { id: siguienteId++, modelo: body.modelo, cliente: body.cliente.trim(), email: body.email, estado: "creado", motivo: null };
        pedidos.set(pedido.id, pedido);

        // como emit es sincrono, cuando esta linea termina el inventario ya respondio
        // y el pedido ya esta confirmado o rechazado
        bus.publicar("pedido.creado", { pedidoId: pedido.id, modelo: pedido.modelo, email: pedido.email });

        return { ...pedido };
    }

    function buscar(id) {
        const pedido = pedidos.get(id);
        if (!pedido) throw new ErrorPedido(404, `No existe el pedido ${id}`);
        return pedido;
    }

    function avanzar(id) {
        const pedido = buscar(id);
        const avance = AVANCES[pedido.estado];
        if (!avance) throw new ErrorPedido(409, `Un pedido "${pedido.estado}" no puede avanzar`);

        pedido.estado = avance.siguiente;
        bus.publicar(avance.evento, { pedidoId: id, modelo: pedido.modelo, email: pedido.email });
        return { ...pedido };
    }

    function cancelar(id) {
        const pedido = buscar(id);
        if (!["creado", "confirmado"].includes(pedido.estado)) {
            throw new ErrorPedido(409, `Un pedido "${pedido.estado}" ya no se puede cancelar`);
        }

        const estabaConfirmado = pedido.estado === "confirmado";
        pedido.estado = "cancelado";
        bus.publicar("pedido.cancelado", { pedidoId: id, modelo: pedido.modelo, email: pedido.email, liberarUnidad: estabaConfirmado });
        return { ...pedido };
    }

    return { crear, avanzar, cancelar, ver: (id) => ({ ...buscar(id) }), listar: () => [...pedidos.values()].map((p) => ({ ...p })), ErrorPedido };
}
