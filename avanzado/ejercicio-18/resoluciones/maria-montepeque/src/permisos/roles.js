// roles del club y lo que puede hacer cada uno
//
// formato de permiso: "recurso:accion:alcance"
//   alcance: propio      -> solo lo suyo
//            mis_alumnos -> lo de los alumnos que tiene a cargo
//            todos       -> cualquiera
//   "*" sirve de comodin en accion o alcance
//
// "hereda": el rol tiene tambien todos los permisos de esos roles
// "nivel": para no dejar que alguien de un rol mas alto que el suyo

export const ROLES = {
    alumno: {
        nivel: 1,
        hereda: [],
        permisos: ["saltos:ver:propio", "saltos:crear:propio", "equipo:ver:todos"]
    },
    rigger: {
        // el que empaca e inspecciona los paracaidas
        nivel: 2,
        hereda: [],
        permisos: ["equipo:ver:todos", "equipo:inspeccionar:todos"]
    },
    instructor: {
        nivel: 3,
        hereda: ["alumno"],
        permisos: ["saltos:ver:mis_alumnos", "saltos:aprobar:mis_alumnos"]
    },
    jefe_dz: {
        // jefe de la zona de salto: todo
        nivel: 4,
        hereda: ["instructor", "rigger"],
        permisos: ["saltos:*:todos", "equipo:*:todos", "usuarios:asignar_rol:todos"]
    }
};
