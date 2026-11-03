// cada rol tiene una lista de permisos
// las rutas piden permisos, no roles, asi si cambia un rol solo se toca aqui
const PERMISOS_POR_ROL = {
    viajero: [
        "tours:ver",
        "reservas:crear",
        "reservas:ver_propias",
        "reservas:cancelar_propias"
    ],
    guia: [
        "tours:ver",
        "tours:editar_propios",
        "reservas:ver_de_mis_tours"
    ],
    admin: [
        "tours:ver",
        "tours:crear",
        "tours:editar",
        "tours:borrar",
        "reservas:ver_todas",
        "reservas:cancelar_todas"
    ]
};

function permisosDe(rol) {
    return PERMISOS_POR_ROL[rol] || [];
}

function tienePermiso(rol, permiso) {
    return permisosDe(rol).includes(permiso);
}

export { PERMISOS_POR_ROL, permisosDe, tienePermiso };
