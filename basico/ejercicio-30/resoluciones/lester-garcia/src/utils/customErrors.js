export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Los datos de la orden de servicio del taller son inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Se requiere la clave de autorización del taller mecánico.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La orden de reparación o motocicleta solicitada no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe una orden registrada con ese código de ticket.") {
    super(message, 409);
  }
}