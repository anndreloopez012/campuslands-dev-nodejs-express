export class AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith("4")? "fail" : "error";
        this.isOperational = true;
//muestra donde esta ocurriendo el error dejando de lado de donde se valida.
        Error.captureStackTrace(this, this.constructor);
        }
}
// Una peticion que no se hizo correctamente.
export class BadRequestError extends AppError {
    constructor(message = "Parametros del servidor o datos de partida invalidos."){
        super(message, 400);

    }
}

// Validacion con autorizacion correspondiente.
export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado. Se requiere clave de matchmaking.") {
    super(message, 401);
  }
}


// Alguna peticion que se sabe a que hace referenecia pero no se encuentra en el sistema.
export class NotFoundError extends AppError{
    constructor(message = "El recurso solicitado no fue encontrado"){
        super(message, 404);

    }
}
// El servidor no puede procesar alguna informacion por conflicto en el sistema.
export class ConflictError extends AppError {
    constructor (message = "Conflicto en la operacion de matchmaking"){
        super(message, 409);
    }
}