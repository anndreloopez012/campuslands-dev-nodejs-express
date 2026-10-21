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
    super("Inconsistencias en los parámetros de búsqueda o consulta.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros de consulta textual inválidos.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La pista o canción solicitada no existe en el catálogo.") {
    super(message, 404);
  }
}