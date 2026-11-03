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
    super("Inconsistencias en los datos de la fórmula química.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros químicos fuera del rango estequiométrico.") {
    super(message, 400);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La fórmula química solicitada no fue encontrada.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe una fórmula registrada con esa nomenclatura molecular.") {
    super(message, 409);
  }
}
