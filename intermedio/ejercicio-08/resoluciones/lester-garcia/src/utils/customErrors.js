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
    super("Inconsistencias en las especificaciones del hiperdeportivo.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Solicitud inválida para la fábrica de hiperautos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado. Se requiere clave de telemetría de fábrica.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El hiperdeportivo solicitado no existe en la base de telemetría.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un hiperauto registrado con ese número de chasis o serie.") {
    super(message, 409);
  }
}