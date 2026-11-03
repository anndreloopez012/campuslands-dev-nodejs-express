import { db, siguienteId } from "../data/db.js";
import AppError from "../utils/app-error.js";
import { paginar } from "../utils/listado.js";
import { validarOrdenNueva, validarRepuestoUsado, MANO_DE_OBRA, ESTADOS } from "../validators/orden.validator.js";
import * as motosService from "./motos.service.js";
import * as repuestosService from "./repuestos.service.js";

// a que estado se puede pasar desde cada estado, y que roles pueden hacerlo
//   pendiente -> en_proceso -> lista -> entregada
//   pendiente -> cancelada
const TRANSICIONES = {
    pendiente: { en_proceso: ["mecanico", "admin"], cancelada: ["recepcion", "admin"] },
    en_proceso: { lista: ["mecanico", "admin"] },
    lista: { entregada: ["recepcion", "admin"] },
    entregada: {},
    cancelada: {}
};

const ahora = () => new Date().toISOString();

// la orden con los datos de la moto y los totales calculados
function conTotales(orden) {
    const moto = db.motos.find((m) => m.id === orden.motoId);
    const manoDeObra = MANO_DE_OBRA[orden.tipo];
    const totalRepuestos = orden.repuestos.reduce((suma, r) => suma + r.precioUnitario * r.cantidad, 0);

    return {
        ...orden,
        moto: moto ? { id: moto.id, placa: moto.placa, modelo: `${moto.marca} ${moto.modelo}` } : null,
        manoDeObra,
        totalRepuestos,
        total: manoDeObra + totalRepuestos
    };
}

// un mecanico solo puede tocar las ordenes que tiene asignadas
function exigirAcceso(orden, usuario) {
    if (usuario.rol === "mecanico" && orden.mecanicoId !== usuario.id) {
        throw new AppError(403, "Esta orden no esta asignada a ti");
    }
}

function buscarOrden(id) {
    const orden = db.ordenes.find((o) => o.id === id);
    if (!orden) {
        throw new AppError(404, `No existe la orden con id ${id}`);
    }
    return orden;
}

export function listar(query = {}, usuario) {
    let ordenes = db.ordenes;

    if (usuario.rol === "mecanico") {
        ordenes = ordenes.filter((o) => o.mecanicoId === usuario.id);
    }

    if (query.estado !== undefined) {
        if (!ESTADOS.includes(query.estado)) {
            throw new AppError(400, `estado debe ser uno de: ${ESTADOS.join(", ")}`);
        }
        ordenes = ordenes.filter((o) => o.estado === query.estado);
    }

    // las mas nuevas primero
    const ordenadas = [...ordenes].sort((a, b) => b.id - a.id).map(conTotales);
    return paginar(ordenadas, query);
}

export function ver(id, usuario) {
    const orden = buscarOrden(id);
    exigirAcceso(orden, usuario);
    return conTotales(orden);
}

// subrecurso: las ordenes de una moto (ejercicio 12)
export function deLaMoto(motoId) {
    motosService.buscar(motoId);
    return db.ordenes.filter((o) => o.motoId === motoId).map(conTotales);
}

export function crear(motoId, body, usuario) {
    motosService.buscar(motoId);
    validarOrdenNueva(body);

    // no abro dos ordenes al mismo tiempo para la misma moto
    const abierta = db.ordenes.find((o) => o.motoId === motoId && ["pendiente", "en_proceso", "lista"].includes(o.estado));
    if (abierta) {
        throw new AppError(409, `La moto ya tiene la orden ${abierta.id} abierta`);
    }

    const fecha = ahora();
    const orden = {
        id: siguienteId(db.ordenes),
        motoId,
        tipo: body.tipo,
        descripcion: body.descripcion.trim(),
        estado: "pendiente",
        mecanicoId: null,
        repuestos: [],
        historial: [{ estado: "pendiente", por: usuario.id, fecha }],
        creada: fecha
    };

    db.ordenes.push(orden);
    return conTotales(orden);
}

export function asignar(id, body = {}) {
    const orden = buscarOrden(id);

    if (!["pendiente", "en_proceso"].includes(orden.estado)) {
        throw new AppError(409, `No se puede asignar una orden en estado "${orden.estado}"`);
    }

    const mecanico = db.usuarios.find((u) => u.id === body.mecanicoId && u.rol === "mecanico");
    if (!mecanico) {
        throw new AppError(400, "mecanicoId tiene que ser de un usuario con rol mecanico");
    }

    orden.mecanicoId = mecanico.id;
    return conTotales(orden);
}

export function cambiarEstado(id, body = {}, usuario) {
    const orden = buscarOrden(id);
    exigirAcceso(orden, usuario);

    const { estado } = body;
    if (!ESTADOS.includes(estado)) {
        throw new AppError(400, `estado debe ser uno de: ${ESTADOS.join(", ")}`);
    }

    const rolesPermitidos = TRANSICIONES[orden.estado][estado];
    if (!rolesPermitidos) {
        throw new AppError(409, `No se puede pasar de "${orden.estado}" a "${estado}"`);
    }
    if (!rolesPermitidos.includes(usuario.rol)) {
        throw new AppError(403, `Pasar a "${estado}" lo hace ${rolesPermitidos.join(" o ")}`);
    }
    if (estado === "en_proceso" && orden.mecanicoId === null) {
        throw new AppError(409, "Primero hay que asignar un mecanico");
    }

    orden.estado = estado;
    orden.historial.push({ estado, por: usuario.id, fecha: ahora() });
    return conTotales(orden);
}

export function agregarRepuesto(id, body = {}, usuario) {
    const orden = buscarOrden(id);
    exigirAcceso(orden, usuario);

    if (orden.estado !== "en_proceso") {
        throw new AppError(409, `Solo se agregan repuestos con la orden en "en_proceso", esta en "${orden.estado}"`);
    }

    validarRepuestoUsado(body);
    const repuesto = repuestosService.buscar(body.repuestoId);

    // primero descuento, si no alcanza tira 409 y la orden queda igual
    repuestosService.descontar(repuesto, body.cantidad);

    const yaUsado = orden.repuestos.find((r) => r.repuestoId === repuesto.id);
    if (yaUsado) {
        yaUsado.cantidad += body.cantidad;
    } else {
        // guardo el precio de hoy, si despues sube no cambia lo que ya se cobro
        orden.repuestos.push({ repuestoId: repuesto.id, nombre: repuesto.nombre, cantidad: body.cantidad, precioUnitario: repuesto.precio });
    }

    return conTotales(orden);
}
