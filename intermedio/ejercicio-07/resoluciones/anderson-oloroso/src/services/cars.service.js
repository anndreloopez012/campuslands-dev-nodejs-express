import { NotFoundError, ConflictError, BadRequestError } from '../errors/app.error.js';

let luxuryCars = [
  { id: 1, marca: 'Ferrari', modelo: 'SF90 Stradale', potenciaHP: 1000, precioUSD: 625000, disponibleTestDrive: true },
  { id: 2, marca: 'Porsche', modelo: '911 GT3 RS', potenciaHP: 525, precioUSD: 241300, disponibleTestDrive: true },
  { id: 3, marca: 'Lamborghini', modelo: 'Revuelto', potenciaHP: 1015, precioUSD: 608000, disponibleTestDrive: false },
  { id: 4, marca: 'Aston Martin', modelo: 'DBS 770 Ultimate', potenciaHP: 770, precioUSD: 387600, disponibleTestDrive: true }
];

let testDriveBookings = [];

export const getAllCars = () => luxuryCars;

export const getCarById = (id) => {
  const carId = Number(id);
  if (isNaN(carId)) {
    throw new BadRequestError('El ID del auto debe ser un número entero válido.');
  }

  const car = luxuryCars.find((c) => c.id === carId);
  if (!car) {
    throw new NotFoundError(`El auto de lujo con ID ${id} no existe en nuestro inventario.`);
  }
  return car;
};

export const bookTestDrive = ({ carId, cliente, fecha }) => {
  if (!carId || !cliente || !fecha) {
    throw new BadRequestError('Los campos carId, cliente y fecha (YYYY-MM-DD) son obligatorios.');
  }

  const car = getCarById(carId);

  if (!car.disponibleTestDrive) {
    throw new ConflictError(`El vehículo ${car.marca} ${car.modelo} es una pieza exclusiva de exhibición y no está disponible para test drive.`);
  }

  const existingBooking = testDriveBookings.find(
    (b) => b.carId === Number(carId) && b.fecha === fecha
  );

  if (existingBooking) {
    throw new ConflictError(`El vehículo ya cuenta con una reserva de prueba agendada para la fecha ${fecha}.`);
  }

  const newBooking = {
    idReserva: `VIP-${Date.now()}`,
    car: `${car.marca} ${car.modelo}`,
    carId: Number(carId),
    cliente: cliente.trim(),
    fecha,
    estado: 'Confirmada con Concierge VIP'
  };

  testDriveBookings.push(newBooking);
  return newBooking;
};
