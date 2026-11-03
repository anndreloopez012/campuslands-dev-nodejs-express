import * as personajes from "../../services/personajes.service.js";
import { aV1 } from "./mapper.js";
import { validarCrearV1 } from "./validator.js";
import AppError from "../../utils/app-error.js";

// v1 responde el arreglo directo, sin { ok, data }
export function listar(req, res) {
    res.json(personajes.listar({ clase: req.query.clase }).map(aV1));
}

export function ver(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        throw new AppError(400, "id invalido");
    }
    res.json(aV1(personajes.buscar(id)));
}

export function crear(req, res) {
    const datos = validarCrearV1(req.body);
    res.status(201).json(aV1(personajes.crear(datos)));
}
