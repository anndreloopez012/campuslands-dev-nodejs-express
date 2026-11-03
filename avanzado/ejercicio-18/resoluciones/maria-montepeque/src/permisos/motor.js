import { ROLES } from "./roles.js";

// motor de permisos
//
// 1. roles efectivos: los que tiene el usuario (menos los vencidos) + los que heredan
// 2. permisos efectivos: la union de los permisos de esos roles
// 3. puede(usuario, "saltos:aprobar", { salto }):
//    - si hay una NEGACION que coincide, NO (la negacion gana siempre)
//    - si algun permiso coincide y su alcance se cumple para ese recurso, SI
//    - si no, NO
// siempre devuelve el motivo, para poder explicar la decision

export function rolesEfectivos(usuario, ahora = Date.now()) {
    const resultado = new Set();
    const visitar = (nombre) => {
        if (resultado.has(nombre) || !ROLES[nombre]) return;
        resultado.add(nombre);
        ROLES[nombre].hereda.forEach(visitar);
    };

    for (const asignado of usuario.roles) {
        // un rol puede tener fecha de vencimiento (ej. instructor por un mes)
        if (asignado.venceEn && Date.parse(asignado.venceEn) <= ahora) continue;
        visitar(asignado.rol);
    }
    return [...resultado];
}

export function permisosEfectivos(usuario, ahora) {
    const permisos = new Set();
    for (const rol of rolesEfectivos(usuario, ahora)) ROLES[rol].permisos.forEach((p) => permisos.add(p));
    return [...permisos].sort();
}

export function nivelMaximo(usuario, ahora) {
    return Math.max(0, ...rolesEfectivos(usuario, ahora).map((r) => ROLES[r].nivel));
}

// "saltos:*" coincide con "saltos:aprobar"
function coincide(patron, valor) {
    return patron === "*" || patron === valor;
}

// el alcance se revisa contra el recurso concreto
function cumpleAlcance(alcance, usuario, contexto) {
    if (alcance === "todos" || alcance === "*") return true;
    // sin recurso (ej. "puede crear saltos en general") el alcance se da por cumplido
    if (!contexto.duenoId) return true;
    if (alcance === "propio") return contexto.duenoId === usuario.id;
    if (alcance === "mis_alumnos") return usuario.alumnos.includes(contexto.duenoId);
    return false;
}

export function puede(usuario, accionCompleta, contexto = {}, ahora = Date.now()) {
    const [recurso, accion] = accionCompleta.split(":");

    // las negaciones son del usuario, no del rol (ej. una restriccion medica)
    for (const negacion of usuario.negaciones) {
        const [nRecurso, nAccion] = negacion.permiso.split(":");
        if (coincide(nRecurso, recurso) && coincide(nAccion, accion)) {
            return { permitido: false, motivo: `negado: ${negacion.motivo}`, regla: `!${negacion.permiso}` };
        }
    }

    const candidatos = permisosEfectivos(usuario, ahora).filter((p) => {
        const [pRecurso, pAccion] = p.split(":");
        return coincide(pRecurso, recurso) && coincide(pAccion, accion);
    });

    if (candidatos.length === 0) {
        return { permitido: false, motivo: `ninguno de sus roles (${rolesEfectivos(usuario, ahora).join(", ") || "ninguno"}) tiene ${recurso}:${accion}` };
    }

    for (const permiso of candidatos) {
        const alcance = permiso.split(":")[2];
        if (cumpleAlcance(alcance, usuario, contexto)) {
            return { permitido: true, motivo: `permitido por ${permiso}`, regla: permiso };
        }
    }

    return { permitido: false, motivo: `tiene ${candidatos.join(", ")} pero el recurso no esta en su alcance` };
}
