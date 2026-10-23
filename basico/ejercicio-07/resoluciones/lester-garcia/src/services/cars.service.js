import { luxuryCars } from "../data/cars.data.js";

const EUR_EXCHANGE_RATE = 0.92;

export const getLuxuryCarsService = (currency = "USD") => {
  return luxuryCars.map((car) => {
    const isEur = currency === "EUR";
    const convertedPrice = isEur
      ? Math.round(car.priceUSD * EUR_EXCHANGE_RATE)
      : car.priceUSD;

    return {
      id: car.id,
      brand: car.brand,
      model: car.model,
      price: convertedPrice,
      currency: isEur ? "EUR" : "USD",
      topSpeedKmh: car.topSpeedKmh
    };
  });
};