/**
 * Servicio de zona/tormenta para Battle Royale
 * Calcula el encogimiento de la zona segura
 */

export const MAX_RADIUS = 500;

const SHRINK_FACTOR = 0.6;
const BASE_DAMAGE_PER_SECOND = 5;
const SHRINK_TIME_BASE = 30;

/**
 * Calcula el nuevo radio de la zona, daño y tiempo de cierre
 * @param {number} currentRadius - Radio actual de la zona
 * @returns {object} Información de la nueva zona
 */
export default function shrinkZone(currentRadius) {
  if (typeof currentRadius !== "number" || currentRadius <= 0) {
    throw new Error("❌ El radio debe ser un número positivo.");
  }

  if (currentRadius > MAX_RADIUS) {
    throw new Error(`❌ El radio no puede superar el máximo de ${MAX_RADIUS}m.`);
  }

  const newRadius = Math.round(currentRadius * SHRINK_FACTOR);
  const phase = Math.ceil(Math.log(MAX_RADIUS / currentRadius) / Math.log(1 / SHRINK_FACTOR)) + 1;
  const damagePerSecond = BASE_DAMAGE_PER_SECOND * phase;
  const timeToClose = Math.max(SHRINK_TIME_BASE - (phase * 5), 10);

  return {
    previousRadius: currentRadius,
    newRadius,
    phase,
    damagePerSecond,
    timeToClose,
    isFinalZone: newRadius < 20
  };
}
