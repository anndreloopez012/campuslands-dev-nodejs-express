import {
    ErrorDeDominio,
    DatosInvalidos,
    NoEncontrado,
    Conflicto,
    EstadoInvalido,
    ReglaDelJuego,
    CATALOGO
} from "../dominio/errores.js";

// el UNICO lugar donde un error del dominio se convierte en un status HTTP
const STATUS_POR_FAMILIA = new Map([
    [DatosInvalidos, 400],
    [NoEncontrado, 404],
    [Conflicto, 409],
    [EstadoInvalido, 409],
    [ReglaDelJuego, 422]
]);

export function statusDe(err) {
    for (const [familia, status] of STATUS_POR_FAMILIA) {
        if (err instanceof familia) return status;
    }
    return 500;
}

// INVENTARIO_LLENO -> inventario-lleno (para la url del tipo)
export const slug = (code) => code.toLowerCase().replaceAll("_", "-");
export const codeDeSlug = (texto) => texto.toUpperCase().replaceAll("-", "_");

// formato "Problem Details" (RFC 9457), el estandar para errores en APIs HTTP
// se responde con Content-Type: application/problem+json
export function aProblema(err, req) {
    if (err instanceof ErrorDeDominio) {
        return {
            // los datos extra del error van al mismo nivel (asi lo permite el estandar)
            // van primero para que nunca pisen los campos de abajo
            ...err.detalles,
            type: `/api/errores/${slug(err.code)}`,
            title: CATALOGO[err.code].titulo,
            status: statusDe(err),
            detail: err.message,
            instance: req.originalUrl,
            code: err.code,
            requestId: req.id
        };
    }

    // error que no esperabamos: no se manda el mensaje real, puede tener datos internos
    return {
        type: "/api/errores/error-interno",
        title: "Error interno",
        status: 500,
        detail: "Algo salio mal de nuestro lado. Si se repite, manda el requestId a soporte.",
        instance: req.originalUrl,
        code: "ERROR_INTERNO",
        requestId: req.id
    };
}

// el catalogo para GET /api/errores
export function catalogoPublico() {
    return Object.entries(CATALOGO).map(([code, { familia, titulo, descripcion }]) => ({
        code,
        type: `/api/errores/${slug(code)}`,
        status: STATUS_POR_FAMILIA.get(familia),
        titulo,
        descripcion
    }));
}
