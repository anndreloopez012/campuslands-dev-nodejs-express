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
    super("Inconsistencias en los parámetros de la nave o planeta.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Solicitud inválida para la Flota Estelar.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso denegado. Se requiere clave del Comando de la Flota.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El recurso estelar solicitado no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto de integridad referencial estelar.") {
    super(message, 409);
  }
}