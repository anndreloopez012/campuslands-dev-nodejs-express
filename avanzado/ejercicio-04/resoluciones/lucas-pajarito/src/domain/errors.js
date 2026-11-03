class DomainError extends Error {
  constructor(code, message) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

class SquadNotFoundError extends DomainError {
  constructor(id) {
    super("SQUAD_NOT_FOUND", `El escuadron con id ${id} no existe`);
  }
}

class SquadFullError extends DomainError {
  constructor(squadName) {
    super("SQUAD_FULL", `El escuadron "${squadName}" ya alcanzo el limite maximo de jugadores`);
  }
}

class InvalidDropZoneError extends DomainError {
  constructor(zone, validZones) {
    super("INVALID_DROP_ZONE", `Zona "${zone}" no permitida. Zonas seguras: ${validZones.join(", ")}`);
  }
}

export { DomainError, SquadNotFoundError, SquadFullError, InvalidDropZoneError };
