export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Marca explícita para distinguir fallos operativos de bugs no controlados

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(errors = []) {
    super("Inconsistencia en los datos del vehículo de lujo.", 400);
    this.errors = errors;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Parámetros de la solicitud del vehículo inválidos.") {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Acceso no autorizado. Se requiere token o llave de concesionario.") {
    super(message, 401);
  }
}

export class NotFoundError extends AppError {
  constructor(message = "El superdeportivo solicitado no se encuentra en el inventario.") {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message = "Ya existe un vehículo registrado con ese número de chasis (VIN).") {
    super(message, 409);
  }
}