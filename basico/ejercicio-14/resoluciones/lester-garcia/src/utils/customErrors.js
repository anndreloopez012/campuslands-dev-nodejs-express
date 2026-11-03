export class AppError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    this.errors = errors; // Para adjuntar detalles de múltiples campos inválidos

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Los datos ingresados no son válidos.", errors = []) {
    super(message, 400, errors);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El libro solicitado no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "El libro ya se encuentra registrado.") {
    super(message, 409);
  }
}