// error con status y un code fijo para el cliente
export class AppError extends Error {
    constructor(status, code, mensaje, detalles) {
        super(mensaje);
        this.status = status;
        this.code = code;
        this.detalles = detalles;
    }
}

// el error que se tira cuando se pide simular una falla a mitad del fichaje
export class FallaSimulada extends Error {
    constructor(paso) {
        super(`Falla simulada despues del paso "${paso}"`);
        this.paso = paso;
    }
}
