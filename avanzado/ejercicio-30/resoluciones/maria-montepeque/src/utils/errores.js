// un solo tipo de error para toda la app: lleva el status http
export class ErrorApp extends Error {
    constructor(status, mensaje, errores) {
        super(mensaje);
        this.status = status;
        this.errores = errores;
    }
}

export const noEncontrado = (que, id) => new ErrorApp(404, `${que} ${id} no existe`);
export const conflicto = (mensaje) => new ErrorApp(409, mensaje);
export const prohibido = (mensaje) => new ErrorApp(403, mensaje);

// convierte "12" -> 12 o lanza 400
export function idValido(texto, nombre = "id") {
    const n = Number(texto);
    if (!Number.isInteger(n) || n < 1) throw new ErrorApp(400, `${nombre} debe ser un entero positivo`);
    return n;
}

// lee ?pagina=&limite= con limites razonables
export function paginacion(query) {
    const pagina = Math.max(1, Number.parseInt(query.pagina, 10) || 1);
    const limite = Math.min(50, Math.max(1, Number.parseInt(query.limite, 10) || 10));
    return { pagina, limite };
}

export function paginar(lista, { pagina, limite }) {
    const total = lista.length;
    return { data: lista.slice((pagina - 1) * limite, pagina * limite), paginacion: { pagina, limite, total, paginas: Math.ceil(total / limite) } };
}
