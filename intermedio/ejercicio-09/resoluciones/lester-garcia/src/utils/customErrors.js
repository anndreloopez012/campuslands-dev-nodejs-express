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
    super("Inconsistencias en los parámetros de consulta o paginación.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros de consulta o peleador inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso denegado. Se requiere clave de comisionado de kickboxing.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El peleador de kickboxing solicitado no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un peleador registrado con ese apodo o licencia.") {
    super(message, 409);
  }
}