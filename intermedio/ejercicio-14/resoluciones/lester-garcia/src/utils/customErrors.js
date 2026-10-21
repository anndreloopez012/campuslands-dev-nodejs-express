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
    super("Inconsistencias en los datos enviados.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Solicitud inválida.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Autenticación requerida. Token inválido o ausente.") {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "No cuentas con los permisos suficientes para esta acción.") {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El recurso solicitado no fue encontrado.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflicto con un recurso existente.") {
    super(message, 409);
  }
}