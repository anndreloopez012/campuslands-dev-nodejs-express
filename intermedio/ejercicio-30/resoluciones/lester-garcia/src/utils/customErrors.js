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
    super("Inconsistencias en los datos de la motocicleta u orden mecánica.", 400);
    this.errors = errors;
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Credencial X-Garage-Key inválida o ausente para operaciones de taller.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La orden de trabajo o motocicleta no fue encontrada en el taller.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un registro con ese número de placa o serie.") {
    super(message, 409);
  }
}
