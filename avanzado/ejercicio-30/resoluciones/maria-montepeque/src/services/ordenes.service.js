import { conflicto, ErrorApp, noEncontrado, paginar, prohibido } from "../utils/errores.js";

// maquina de estados de una orden de trabajo del taller
//   recibida -> diagnostico -> (esperando_repuestos) -> en_reparacion -> lista -> entregada
//   y antes de reparar se puede cancelar
// cada paso dice que roles lo pueden hacer (admin siempre puede)
export const TRANSICIONES = {
    recibida: { diagnostico: ["mecanico"], cancelada: ["recepcion"] },
    diagnostico: { esperando_repuestos: ["mecanico"], en_reparacion: ["mecanico"], cancelada: ["recepcion"] },
    esperando_repuestos: { en_reparacion: ["mecanico"], cancelada: ["recepcion"] },
    en_reparacion: { lista: ["mecanico"] },
    lista: { entregada: ["recepcion"] },
    entregada: {},
    cancelada: {}
};

export const ESTADOS = Object.keys(TRANSICIONES);
const ESTADOS_CON_REPUESTOS = ["diagnostico", "esperando_repuestos", "en_reparacion"];
const METODOS_PAGO = ["efectivo", "tarjeta", "transferencia"];

export function puedeCambiar(desde, hacia, rol) {
    const roles = TRANSICIONES[desde]?.[hacia];
    if (!roles) return { ok: false, status: 409, motivo: `No se puede pasar de ${desde} a ${hacia}` };
    if (rol !== "admin" && !roles.includes(rol)) return { ok: false, status: 403, motivo: `El rol ${rol} no puede pasar la orden a ${hacia}` };
    return { ok: true };
}

// todo en centavos. IVA de Guatemala: 12 %
export function calcularTotal(orden, tarifaHora) {
    const repuestos = orden.repuestos.reduce((t, r) => t + r.cantidad * r.precioUnitario, 0);
    const manoDeObra = Math.round(orden.manoDeObra.reduce((t, m) => t + m.horas, 0) * tarifaHora);
    const subtotal = repuestos + manoDeObra;
    const iva = Math.round(subtotal * 0.12);
    return { repuestos, manoDeObra, subtotal, iva, total: subtotal + iva };
}

export function crearOrdenesService({ store, motos, repuestos, auditoria, config, reloj = () => new Date() }) {
    function buscar(id) {
        const orden = store.ordenes.find((o) => o.id === id);
        if (!orden) throw noEncontrado("La orden", id);
        return orden;
    }

    const vista = (o) => ({ ...o, totales: calcularTotal(o, config.tarifaHora) });

    function crear(usuario, body = {}) {
        const errores = [];
        if (!Number.isInteger(body.motoId)) errores.push("motoId es obligatorio");
        if (typeof body.problema !== "string" || body.problema.trim().length < 10) errores.push("problema debe explicar la falla (minimo 10 letras)");
        if (!Number.isInteger(body.kilometraje) || body.kilometraje < 0 || body.kilometraje > 500_000) errores.push("kilometraje debe ser de 0 a 500000");
        if (errores.length > 0) throw new ErrorApp(400, "Datos invalidos", errores);

        const moto = motos.buscar(body.motoId);
        if (store.ordenes.some((o) => o.motoId === moto.id && !["entregada", "cancelada"].includes(o.estado))) throw conflicto(`La moto ${moto.placa} ya tiene una orden abierta`);

        const orden = {
            id: store.siguiente.ordenes++,
            motoId: moto.id,
            placa: moto.placa,
            problema: body.problema.trim(),
            kilometraje: body.kilometraje,
            estado: "recibida",
            repuestos: [],
            manoDeObra: [],
            pago: null,
            creada: reloj().toISOString(),
            recibidaPor: usuario.id
        };
        store.ordenes.push(orden);
        auditoria.anotar(usuario, "orden.creada", orden.id, { placa: moto.placa });
        return vista(orden);
    }

    function listar({ estado, placa } = {}, pagina) {
        if (estado && !ESTADOS.includes(estado)) throw new ErrorApp(400, `estado debe ser: ${ESTADOS.join(", ")}`);
        const filtradas = store.ordenes.filter((o) => (!estado || o.estado === estado) && (!placa || o.placa === placa.toUpperCase())).map(vista);
        return paginar(filtradas, pagina);
    }

    function cambiarEstado(usuario, id, { estado, nota } = {}) {
        const orden = buscar(id);
        if (!ESTADOS.includes(estado)) throw new ErrorApp(400, `estado debe ser: ${ESTADOS.join(", ")}`);
        const permiso = puedeCambiar(orden.estado, estado, usuario.rol);
        if (!permiso.ok) throw new ErrorApp(permiso.status, permiso.motivo);

        // reglas extra de algunos pasos
        if (estado === "lista" && orden.manoDeObra.length === 0) throw conflicto("Registra la mano de obra antes de marcarla como lista");
        if (estado === "entregada" && !orden.pago) throw conflicto("No se puede entregar sin pagar");
        if (estado === "cancelada" && (typeof nota !== "string" || nota.trim().length < 5)) throw new ErrorApp(400, "Para cancelar hay que escribir el motivo en nota");

        if (estado === "cancelada") orden.repuestos.forEach((r) => repuestos.liberar(r.repuestoId, r.cantidad));
        if (estado === "entregada") orden.repuestos.forEach((r) => repuestos.consumir(r.repuestoId, r.cantidad));

        const antes = orden.estado;
        orden.estado = estado;
        auditoria.anotar(usuario, "orden.estado", id, { de: antes, a: estado, nota });
        return vista(orden);
    }

    function agregarRepuesto(usuario, id, { repuestoId, cantidad } = {}) {
        const orden = buscar(id);
        if (!["mecanico", "admin"].includes(usuario.rol)) throw prohibido("Solo mecanicos agregan repuestos");
        if (!ESTADOS_CON_REPUESTOS.includes(orden.estado)) throw conflicto(`No se agregan repuestos a una orden ${orden.estado}`);
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) throw new ErrorApp(400, "cantidad debe ser de 1 a 20");

        // el precio se copia a la orden: si despues sube, la orden no cambia
        const repuesto = repuestos.reservar(repuestoId, cantidad);
        const linea = orden.repuestos.find((r) => r.repuestoId === repuestoId);
        if (linea) linea.cantidad += cantidad;
        else orden.repuestos.push({ repuestoId, nombre: repuesto.nombre, cantidad, precioUnitario: repuesto.precio });

        auditoria.anotar(usuario, "orden.repuesto", id, { repuestoId, cantidad });
        return vista(orden);
    }

    function agregarManoDeObra(usuario, id, { horas, descripcion } = {}) {
        const orden = buscar(id);
        if (!["mecanico", "admin"].includes(usuario.rol)) throw prohibido("Solo mecanicos registran mano de obra");
        if (orden.estado !== "en_reparacion") throw conflicto("La mano de obra se registra mientras la moto esta en reparacion");
        // horas en cuartos de hora: 0.25, 0.5, 1.75...
        if (typeof horas !== "number" || horas <= 0 || horas > 40 || !Number.isInteger(horas * 4)) throw new ErrorApp(400, "horas debe ser mayor a 0, maximo 40, en cuartos de hora (0.25)");
        if (typeof descripcion !== "string" || descripcion.trim().length < 5) throw new ErrorApp(400, "descripcion es obligatoria");

        orden.manoDeObra.push({ horas, descripcion: descripcion.trim(), mecanicoId: usuario.id });
        auditoria.anotar(usuario, "orden.mano_de_obra", id, { horas });
        return vista(orden);
    }

    // pago idempotente: la misma llave devuelve el mismo resultado sin cobrar de nuevo
    function pagar(usuario, id, llave, { monto, metodo } = {}) {
        if (!llave || !/^[\w-]{8,64}$/.test(llave)) throw new ErrorApp(400, "Falta el header Idempotency-Key (8 a 64 caracteres)");
        const guardado = store.pagos.get(llave);
        if (guardado) {
            if (guardado.ordenId !== id || guardado.monto !== monto || guardado.metodo !== metodo) throw new ErrorApp(422, "Esa Idempotency-Key ya se uso con otro pago");
            return { ...guardado.respuesta, repetido: true };
        }

        if (!["recepcion", "admin"].includes(usuario.rol)) throw prohibido("Solo recepcion cobra");
        const orden = buscar(id);
        if (orden.estado !== "lista") throw conflicto("Solo se cobra una orden lista");
        if (orden.pago) throw conflicto("La orden ya esta pagada");
        if (!METODOS_PAGO.includes(metodo)) throw new ErrorApp(400, `metodo debe ser: ${METODOS_PAGO.join(", ")}`);
        const { total } = calcularTotal(orden, config.tarifaHora);
        if (monto !== total) throw new ErrorApp(400, `El monto debe ser exactamente el total: ${total} centavos`);

        orden.pago = { monto, metodo, fecha: reloj().toISOString(), cobradoPor: usuario.id };
        auditoria.anotar(usuario, "orden.pagada", id, { monto, metodo });
        const respuesta = vista(orden);
        store.pagos.set(llave, { ordenId: id, monto, metodo, respuesta });
        return { ...respuesta, repetido: false };
    }

    return {
        crear,
        listar,
        ver: (id) => vista(buscar(id)),
        cambiarEstado,
        agregarRepuesto,
        agregarManoDeObra,
        pagar,
        historial: (id) => (buscar(id), auditoria.deOrden(id))
    };
}
