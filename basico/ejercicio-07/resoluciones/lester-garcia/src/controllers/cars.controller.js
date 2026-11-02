import { getLuxuryCarsService } from "../services/cars.service.js";

export const getCarsController = (req, res) => {
  const defaultCurrency = req.app.get("defaultCurrency") || "USD";
  const cars = getLuxuryCarsService(defaultCurrency);

  return res.status(200).json({
    status: "success",
    activeCurrency: defaultCurrency,
    total: cars.length,
    data: cars
  });
};