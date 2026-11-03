// usuarios del club, sus roles y a quien tienen a cargo
export function crearDatos() {
    return {
        usuarios: [
            { id: 1, nombre: "Sara (alumna)", roles: [{ rol: "alumno" }], alumnos: [], negaciones: [] },
            { id: 2, nombre: "Hugo (alumno con restriccion)", roles: [{ rol: "alumno" }], alumnos: [], negaciones: [{ permiso: "saltos:crear", motivo: "restriccion medica hasta nuevo examen" }] },
            { id: 3, nombre: "Ines (instructora de Sara y Hugo)", roles: [{ rol: "instructor" }], alumnos: [1, 2], negaciones: [] },
            { id: 4, nombre: "Rafa (instructor de nadie, tambien rigger)", roles: [{ rol: "instructor" }, { rol: "rigger" }], alumnos: [], negaciones: [] },
            { id: 5, nombre: "Diana (jefa de la zona)", roles: [{ rol: "jefe_dz" }], alumnos: [], negaciones: [] },
            { id: 6, nombre: "Tomas (instructor temporal vencido)", roles: [{ rol: "alumno" }, { rol: "instructor", venceEn: "2020-01-01T00:00:00Z" }], alumnos: [1], negaciones: [] }
        ],
        saltos: [
            { id: 1, alumnoId: 1, altitud: 4000, fecha: "2026-10-01", estado: "pendiente" },
            { id: 2, alumnoId: 2, altitud: 3500, fecha: "2026-10-02", estado: "aprobado" },
            { id: 3, alumnoId: 4, altitud: 4200, fecha: "2026-10-03", estado: "pendiente" }
        ],
        equipo: [
            { id: 1, nombre: "Paracaidas principal Sabre 3", ultimaInspeccion: "2026-06-01" },
            { id: 2, nombre: "Reserva PD 176", ultimaInspeccion: "2026-04-15" }
        ]
    };
}
