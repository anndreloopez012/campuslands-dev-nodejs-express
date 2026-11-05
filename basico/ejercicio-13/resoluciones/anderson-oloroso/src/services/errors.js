export class WarpError extends Error {
  constructor(message) {
    super(message);
    this.name = "WarpError";
  }
}

export class InvalidCoordinatesError extends WarpError {
  constructor(destination) {
    super(`Coordenadas inválidas para destino: "${destination}".`);
    this.name = "InvalidCoordinatesError";
    this.destination = destination;
  }
}

export class InsufficientFuelError extends WarpError {
  constructor(fuel, required) {
    super(
      `Combustible insuficiente: ${fuel} unidades. Se requieren al menos ${required}.`
    );
    this.name = "InsufficientFuelError";
    this.fuel = fuel;
    this.required = required;
  }
}
