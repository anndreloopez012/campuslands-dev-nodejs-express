// citas del estudio de tatuajes
// cada cambio se audita con el antes y el despues

const PERMISOS = {
    "citas.crear": ["recepcion", "admin"],
    "citas.reprogramar": ["recepcion", "tatuador", "admin"],
    "citas.cancelar": ["recepcion", "admin"],
    "citas.registrar_salud": ["tatuador", "admin"],
    "auditoria.consultar": ["auditor", "admin"]
};

export class ErrorCita extends Error {
    constructor(status, mensaje) {
        super(mensaje);
        this.status = status;
    }
}

export function crearCitas(auditoria) {
    const citas = new Map();
    let siguienteId = 1;

    // revisa el permiso y, si no lo tiene, deja el intento en la auditoria
    function exigir(actor, accion, recurso, contexto) {
        if (!PERMISOS[accion].includes(actor.rol)) {
            auditoria.anotar({ actor, accion, resultado: "denegado", recurso, motivo: `el rol ${actor.rol} no puede ${accion}`, contexto });
            throw new ErrorCita(403, `Tu rol (${actor.rol}) no puede ${accion}`);
        }
    }

    function buscar(id) {
        const cita = citas.get(id);
        if (!cita) throw new ErrorCita(404, `No existe la cita ${id}`);
        return cita;
    }

    function crear(actor, body = {}, contexto) {
        exigir(actor, "citas.crear", { tipo: "cita", id: null }, contexto);
        const errores = [];
        if (typeof body.cliente !== "string" || body.cliente.trim().length < 2) errores.push("cliente es obligatorio");
        if (typeof body.diseno !== "string" || body.diseno.trim().length < 3) errores.push("diseno es obligatorio");
        if (typeof body.fecha !== "string" || Number.isNaN(Date.parse(body.fecha))) errores.push("fecha debe ser una fecha");
        if (errores.length > 0) throw Object.assign(new ErrorCita(400, "Datos invalidos"), { errores });

        const cita = { id: siguienteId++, cliente: body.cliente.trim(), diseno: body.diseno.trim(), fecha: body.fecha, tatuadorId: body.tatuadorId ?? null, estado: "agendada" };
        citas.set(cita.id, cita);
        auditoria.anotar({ actor, accion: "citas.crear", recurso: { tipo: "cita", id: cita.id }, despues: cita, contexto });
        return { ...cita };
    }

    function reprogramar(actor, id, body = {}, contexto) {
        const cita = buscar(id);
        exigir(actor, "citas.reprogramar", { tipo: "cita", id }, contexto);
        if (typeof body.fecha !== "string" || Number.isNaN(Date.parse(body.fecha))) throw new ErrorCita(400, "fecha debe ser una fecha");
        if (typeof body.motivo !== "string" || body.motivo.trim().length < 3) throw new ErrorCita(400, "motivo es obligatorio para reprogramar");
        if (cita.estado !== "agendada") throw new ErrorCita(409, `Una cita ${cita.estado} no se puede reprogramar`);

        const antes = { ...cita };
        cita.fecha = body.fecha;
        auditoria.anotar({ actor, accion: "citas.reprogramar", recurso: { tipo: "cita", id }, antes, despues: cita, motivo: body.motivo.trim(), contexto });
        return { ...cita };
    }

    function cancelar(actor, id, body = {}, contexto) {
        const cita = buscar(id);
        exigir(actor, "citas.cancelar", { tipo: "cita", id }, contexto);
        if (cita.estado === "cancelada") throw new ErrorCita(409, "La cita ya esta cancelada");

        const antes = { ...cita };
        cita.estado = "cancelada";
        auditoria.anotar({ actor, accion: "citas.cancelar", recurso: { tipo: "cita", id }, antes, despues: cita, motivo: body.motivo, contexto });
        return { ...cita };
    }

    // datos de salud: se auditan, pero el valor NO queda en la auditoria
    function registrarSalud(actor, id, body = {}, contexto) {
        const cita = buscar(id);
        exigir(actor, "citas.registrar_salud", { tipo: "cita", id }, contexto);
        if (typeof body.alergias !== "string") throw new ErrorCita(400, "alergias debe ser texto (puede ser 'ninguna')");

        const antes = { ...cita };
        cita.alergias = body.alergias.trim();
        auditoria.anotar({ actor, accion: "citas.registrar_salud", recurso: { tipo: "cita", id }, antes, despues: cita, contexto });
        return { ...cita };
    }

    return { crear, reprogramar, cancelar, registrarSalud, exigir, ver: (id) => ({ ...buscar(id) }) };
}
