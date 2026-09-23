import { InvalidCoordinatesError, InsufficientFuelError } from "./errors.js";

const FUEL_PER_JUMP = 50;

function jumpToSystem({ system, fuel }) {
  if (!system || typeof system !== "string" || !system.trim()) {
    throw new InvalidCoordinatesError();
  }

  const numericFuel = Number(fuel);
  if (Number.isNaN(numericFuel) || numericFuel < FUEL_PER_JUMP) {
    throw new InsufficientFuelError();
  }

  return {
    system: system.trim(),
    fuelUsed: FUEL_PER_JUMP,
    fuelRemaining: numericFuel - FUEL_PER_JUMP,
  };
}

export { jumpToSystem };
