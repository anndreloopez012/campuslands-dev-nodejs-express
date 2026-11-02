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
  constructor(message = "Parámetros del lobby o configuración de entorno inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "No autorizado. Se requiere la clave secreta del servidor.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El lobby de Battle Royale solicitado no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un lobby registrado con ese código.") {
    super(message, 409);
  }
}