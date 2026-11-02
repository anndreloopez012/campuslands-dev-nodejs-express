export class AppError extends Error{
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4")? "fail":"error";
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export class BadRequestError extends AppError {
    constructor(message = "Parametros de entrada o consulta invalidos para la junta de soldadura."){
        super(message, 400);

    }

}

export class NotFoundError extends AppError{
    constructor(message = " El registro de soldadura solicitado no se encuentra en el taller."){
        super(message,404 );
    }

}

export class ConflictError extends AppError {
    constructor(message = "Ya existe un trabajo registrado con esa clave/codigo"){
        super(message, 409);
    }
}