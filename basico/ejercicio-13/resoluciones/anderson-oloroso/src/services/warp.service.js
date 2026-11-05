import { InvalidCoordinatesError, InsufficientFuelError } from "./errors.js";

const VALID_DESTINATIONS = [
  "Andrómeda",
  "Kepler-442b",
  "Próxima Centauri",
  "Trappist-1e",
  "Titán",
  "Europa",
];

const MIN_FUEL = 50;

/**
 * Calcula un salto warp a un destino con cierta cantidad de combustible.
 * @param {string} destination - Destino del salto
 * @param {number} fuel - Unidades de combustible disponibles
 * @returns {Object} Resultado del cálculo warp
 */
export function calculateWarp(destination, fuel) {
  if (
    !destination ||
    typeof destination !== "string" ||
    destination.trim() === ""
  ) {
    throw new InvalidCoordinatesError(destination || "(vacío)");
  }

  const dest = VALID_DESTINATIONS.find(
    (d) => d.toLowerCase() === destination.trim().toLowerCase()
  );

  if (!dest) {
    throw new InvalidCoordinatesError(destination);
  }

  const parsedFuel = Number(fuel);
  if (isNaN(parsedFuel) || parsedFuel < MIN_FUEL) {
    throw new InsufficientFuelError(parsedFuel || 0, MIN_FUEL);
  }

  const travelTime = Math.floor(Math.random() * 10) + 1;
  const fuelUsed = Math.floor(parsedFuel * 0.6);

  return {
    destination: dest,
    fuelUsed,
    fuelRemaining: parsedFuel - fuelUsed,
    travelTime: `${travelTime} años luz`,
    status: "Salto warp exitoso",
  };
}
