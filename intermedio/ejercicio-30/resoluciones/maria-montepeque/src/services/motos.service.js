import { db, siguienteId } from "../data/db.js";
import AppError from "../utils/app-error.js";
import { normalizar } from "../utils/validar.js";
import { paginar, ordenar } from "../utils/listado.js";
import { validarMotoNueva } from "../validators/moto.validator.js";

const CAMPOS_ORDEN = ["placa", "marca", "anio", "km", "cilindraje"];

// filtros, busqueda, orden y paginacion juntos (ejercicios 09, 10 y 11)
export function listar(query = {}) {
    let motos = db.motos;

    if (query.marca !== undefined) {
        const marca = normalizar(query.marca);
        motos = motos.filter((m) => normalizar(m.marca) === marca);
    }

    if (query.q !== undefined) {
        const texto = normalizar(query.q);
        if (texto.length < 2) {
            throw new AppError(400, "q debe tener al menos 2 letras");
        }
        motos = motos.filter((m) =>
            [m.placa, m.marca, m.modelo, m.propietario.nombre].some((campo) => normalizar(campo).includes(texto))
        );
    }

    if (query.anioDesde !== undefined) {
        const desde = Number(query.anioDesde);
        if (!Number.isInteger(desde)) {
            throw new AppError(400, "anioDesde debe ser un numero entero");
        }
        motos = motos.filter((m) => m.anio >= desde);
    }

    motos = ordenar(motos, query.sort, CAMPOS_ORDEN);
    return paginar(motos, query);
}

export function buscar(id) {
    const moto = db.motos.find((m) => m.id === id);
    if (!moto) {
        throw new AppError(404, `No existe la moto con id ${id}`);
    }
    return moto;
}

export function crear(body) {
    validarMotoNueva(body);

    const placa = body.placa.trim().toUpperCase();
    if (db.motos.some((m) => m.placa === placa)) {
        throw new AppError(409, `Ya hay una moto registrada con la placa ${placa}`);
    }

    const moto = {
        id: siguienteId(db.motos),
        placa,
        marca: body.marca.trim(),
        modelo: body.modelo.trim(),
        anio: body.anio,
        cilindraje: body.cilindraje,
        km: body.km,
        propietario: { nombre: body.propietario.nombre.trim(), telefono: body.propietario.telefono }
    };

    db.motos.push(moto);
    return moto;
}
