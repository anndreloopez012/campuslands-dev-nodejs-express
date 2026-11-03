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
    super("Inconsistencias en los datos de la sesión de tatuaje.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Solicitud inválida para el estudio de tatuajes.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El recurso solicitado no fue encontrado en el estudio.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un registro con esos datos en el estudio.") {
    super(message, 409);
  }
}
