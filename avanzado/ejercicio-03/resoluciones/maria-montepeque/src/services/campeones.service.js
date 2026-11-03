import { db } from "../data/db.js";
import AppError from "../shared/app-error.js";

// aqui los datos ya llegan validados por el schema (tipos, rangos, formato)
// el service solo revisa lo que necesita los datos guardados: que exista, que no se repita

const siguienteId = () => Math.max(0, ...db.campeones.map((c) => c.id)) + 1;

export function listar({ rol, dificultadMax, q, page, limit }) {
    let lista = db.campeones;
    if (rol) lista = lista.filter((c) => c.rol === rol);
    if (dificultadMax) lista = lista.filter((c) => c.dificultad <= dificultadMax);
    if (q) lista = lista.filter((c) => c.nombre.toLowerCase().includes(q.toLowerCase()));

    return {
        data: lista.slice((page - 1) * limit, page * limit),
        meta: { page, limit, total: lista.length }
    };
}

export function buscar(id) {
    const campeon = db.campeones.find((c) => c.id === id);
    if (!campeon) {
        throw new AppError(404, `No existe el campeon con id ${id}`);
    }
    return campeon;
}

function exigirNombreLibre(nombre, idActual = null) {
    if (db.campeones.some((c) => c.id !== idActual && c.nombre.toLowerCase() === nombre.toLowerCase())) {
        throw new AppError(409, `Ya existe un campeon llamado ${nombre}`);
    }
}

export function crear(datos) {
    exigirNombreLibre(datos.nombre);
    const nuevo = { id: siguienteId(), ...datos };
    db.campeones.push(nuevo);
    return nuevo;
}

export function editar(id, cambios) {
    const campeon = buscar(id);
    if (cambios.nombre) exigirNombreLibre(cambios.nombre, id);
    Object.assign(campeon, cambios);
    return campeon;
}
