import { hypercars } from "../data/hypercars.data.js";

export const getHypercarsService = () => {
  return hypercars;
};

export const getTelemetryService = (id) => {
  const car = hypercars.find((item) => item.id === id);
  if (!car) return null;

  return {
    car: `${car.brand} ${car.model}`,
    telemetry: {
      horsepower: car.horsepower,
      topSpeedKmh: car.topSpeedKmh,
      status: "Telemetry active",
      timestamp: new Date().toISOString()
    }
  };
};