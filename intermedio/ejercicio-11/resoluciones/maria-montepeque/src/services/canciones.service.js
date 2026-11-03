import { canciones } from "../data/canciones.js";
import AppError from "../utils/app-error.js";
import normalizeText from "../utils/normalize-text.js";

// campos donde se puede buscar
const CAMPOS = ["titulo", "artista", "album", "genero"];

function findAll() {
    return canciones;
}

function findById(id) {
    const cancion = canciones.find((cancion) => cancion.id === id);

    if (!cancion) {
        throw new AppError(404, `No existe la cancion con id ${id}`);
    }

    return cancion;
}

function search(q, campo) {
    // valido que manden algo para buscar
    if (typeof q !== "string" || q.trim().length < 2) {
        throw new AppError(400, "El parametro q es obligatorio y debe tener al menos 2 letras");
    }

    if (campo && !CAMPOS.includes(campo)) {
        throw new AppError(400, `El campo "${campo}" no existe, usa uno de: ${CAMPOS.join(", ")}`);
    }

    // si mandan campo busco solo ahi, si no en todos
    const camposABuscar = campo ? [campo] : CAMPOS;
    const texto = normalizeText(q);

    return canciones.filter((cancion) => {
        return camposABuscar.some((key) => normalizeText(cancion[key]).includes(texto));
    });
}

export { findAll, findById, search };
