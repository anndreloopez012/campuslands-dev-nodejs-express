import { motorcycles } from '../data/motorcycle.data.js';

export const listMotorcycles = (req, res) => {
  res.status(200).json({
    ok: true,
    total: motorcycles.length,
    data: motorcycles
  });
};

export const registerMotorcycle = (req, res) => {
  const { brand, model, displacementCc, mileageKm, status = "En Taller" } = req.body;

  const newBike = {
    id: motorcycles.length > 0 ? Math.max(...motorcycles.map(m => m.id)) + 1 : 1,
    brand: brand.trim(),
    model: model.trim(),
    displacementCc: Number(displacementCc),
    mileageKm: Number(mileageKm),
    status,
    registeredAt: new Date().toISOString()
  };

  motorcycles.push(newBike);

  res.status(201).json({
    ok: true,
    message: "Motocicleta ingresada al taller con éxito",
    data: newBike
  });
};