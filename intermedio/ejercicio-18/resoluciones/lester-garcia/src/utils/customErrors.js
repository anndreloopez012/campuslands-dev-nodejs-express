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
    super("Inconsistencias en los datos del paracaidista o salto.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Solicitud inválida para la dropzone.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Credenciales incorrectas o autenticación requerida.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El recurso solicitado no fue encontrado.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un registro con esos datos.") {
    super(message, 409);
  }
}