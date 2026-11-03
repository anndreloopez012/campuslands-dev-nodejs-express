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
  constructor(message = "Parámetros o estadísticas del campeón inválidas.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso no autorizado. Se requiere clave de balance del juego.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El campeón o registro MOBA solicitado no existe.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un campeón registrado con ese nombre.") {
    super(message, 409);
  }
}