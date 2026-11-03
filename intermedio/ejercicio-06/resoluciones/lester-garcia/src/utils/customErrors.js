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
    super("Errores en la validación de los datos enviados.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros de la orden de taller inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso denegado. Se requiere clave de mecánico en cabecera.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El registro de motocicleta u orden no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un registro con ese número de serie o placa.") {
    super(message, 409);
  }
}