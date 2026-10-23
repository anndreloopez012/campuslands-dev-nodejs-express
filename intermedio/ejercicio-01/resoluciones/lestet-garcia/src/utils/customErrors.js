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
  constructor(message = "Los atributos o datos de la clase RPG son inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso no autorizado. Se requiere la llave de desarrollador del reino.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "La clase de personaje RPG solicitada no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe una clase RPG registrada con ese nombre.") {
    super(message, 409);
  }
}