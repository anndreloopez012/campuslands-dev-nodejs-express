export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros de la partida o del jugador de esports inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso denegado. Se requiere la llave de operador del torneo.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El recurso solicitado (partida o jugador) no existe en el sistema.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un registro con idénticos datos en el torneo.") {
    super(message, 409);
  }
}