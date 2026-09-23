class WarpError extends Error {
  constructor(message) {
    super(message);
    this.name = "WarpError";
  }
}

class InvalidCoordinatesError extends WarpError {
  constructor() {
    super("Coordenadas de salto invalidas");
    this.name = "InvalidCoordinatesError";
  }
}

class InsufficientFuelError extends WarpError {
  constructor() {
    super("Combustible insuficiente para el salto");
    this.name = "InsufficientFuelError";
  }
}

export { WarpError, InvalidCoordinatesError, InsufficientFuelError };
