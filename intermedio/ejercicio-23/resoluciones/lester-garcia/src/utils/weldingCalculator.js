import { BadRequestError } from "./customErrors.js";

const PROCESS_EFFICIENCY = {
  TIG: 0.6,
  MIG: 0.8,
  SMAW: 0.7,
  SAW: 0.95
};

/**
 * Calcula el aporte térmico (Heat Input en kJ/mm):
 * Q = (Voltaje * Amperaje * 60 * Eficiencia) / (1000 * Velocidad_mm_min)
 */
export const calculateHeatInput = ({ voltage, amperage, travelSpeedMmMin, weldingProcess }) => {
  const v = Number(voltage);
  const a = Number(amperage);
  const speed = Number(travelSpeedMmMin);
  const efficiency = PROCESS_EFFICIENCY[weldingProcess];

  if (!efficiency) {
    throw new BadRequestError(`Proceso '${weldingProcess}' no reconocido. Use TIG, MIG, SMAW o SAW.`);
  }

  if (isNaN(v) || v <= 0 || isNaN(a) || a <= 0 || isNaN(speed) || speed <= 0) {
    throw new BadRequestError("Voltaje, amperaje y velocidad de avance deben ser mayores a 0.");
  }

  const heatInputKjMm = (v * a * 60 * efficiency) / (1000 * speed);
  return Number(heatInputKjMm.toFixed(2));
};

export const classifyWeldQuality = (heatInputKjMm) => {
  if (heatInputKjMm < 0.5) return "Falta_Penetracion";
  if (heatInputKjMm <= 2.5) return "Aprobado_AWS_D1_1";
  return "Sobrecalentamiento_ZAC";
};
