export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors = []) {
    super("Inconsistencias en los datos de la partida competitiva.", 400);
    this.errors = errors;
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Jugador bloqueado por el sistema Anticheat.") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El registro de partida competitiva no fue encontrado.") {
    super(message, 404);
  }
}
