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
    super("Inconsistencias en los parámetros de consulta u ordenamiento.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros de consulta inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso denegado. Se requiere clave de comisionado de tenis de mesa.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El jugador de tenis de mesa solicitado no existe.") {
    super(message, 404);
  }
}