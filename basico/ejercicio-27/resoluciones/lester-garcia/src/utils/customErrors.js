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
  constructor(message = "Parámetros del torneo MOBA o estadísticas inválidas.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La partida o torneo MOBA solicitado no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe una partida registrada con idéntica información en este torneo.") {
    super(message, 409);
  }
}