import path from "node:path";
import { proyectos, archivos } from "../data/db.js";
import AppError from "../utils/app-error.js";

let nextId = 1;

// segun la extension le pongo una categoria
const CATEGORIAS = { ".pdf": "plano", ".png": "render", ".jpg": "render", ".jpeg": "render", ".glb": "modelo 3D" };

function idValido(id, que) {
    if (!Number.isInteger(id)) {
        throw new AppError(400, `El id del ${que} debe ser un numero`);
    }
}

function findProyecto(id) {
    idValido(id, "proyecto");
    const proyecto = proyectos.find((p) => p.id === id);
    if (!proyecto) {
        throw new AppError(404, `No existe el proyecto con id ${id}`);
    }
    return proyecto;
}

// lo que se responde, sin el buffer
function info(archivo) {
    const { buffer, ...resto } = archivo;
    return resto;
}

// quito carpetas y caracteres raros del nombre que manda el cliente
function limpiarNombre(nombre) {
    const base = path.basename(nombre);
    return base.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
}

function findProyectos() {
    return proyectos.map((p) => ({
        ...p,
        totalArchivos: archivos.filter((a) => a.proyectoId === p.id).length
    }));
}

function guardar(proyectoId, files) {
    findProyecto(proyectoId);

    if (!files || files.length === 0) {
        throw new AppError(400, 'No llego ningun archivo, mandalos en el campo "archivos"');
    }

    const nuevos = files.map((file) => {
        const extension = path.extname(file.originalname).toLowerCase();
        const archivo = {
            id: nextId++,
            proyectoId,
            nombre: limpiarNombre(file.originalname),
            categoria: CATEGORIAS[extension],
            mimetype: file.mimetype,
            tamanoBytes: file.size,
            subido: new Date().toISOString(),
            buffer: file.buffer
        };
        archivos.push(archivo);
        return info(archivo);
    });

    return nuevos;
}

function findDelProyecto(proyectoId) {
    findProyecto(proyectoId);
    return archivos.filter((a) => a.proyectoId === proyectoId).map(info);
}

function findArchivo(id) {
    idValido(id, "archivo");
    const archivo = archivos.find((a) => a.id === id);
    if (!archivo) {
        throw new AppError(404, `No existe el archivo con id ${id}`);
    }
    return archivo;
}

function remove(id) {
    const archivo = findArchivo(id);
    archivos.splice(archivos.indexOf(archivo), 1);
}

export { findProyectos, guardar, findDelProyecto, findArchivo, remove, info };
