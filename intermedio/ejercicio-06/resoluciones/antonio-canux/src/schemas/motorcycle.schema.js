export const createMotorcycleRules = {
  brand: {
    required: true,
    type: "string",
    minLength: 2,
    message: "La marca debe ser un texto de al menos 2 caracteres."
  },
  model: {
    required: true,
    type: "string",
    minLength: 2,
    message: "El modelo debe ser un texto de al menos 2 caracteres."
  },
  displacementCc: {
    required: true,
    type: "number",
    min: 50,
    max: 2500,
    message: "El cilindraje (displacementCc) debe ser un número entre 50 y 2500 cc."
  },
  mileageKm: {
    required: true,
    type: "number",
    min: 0,
    message: "El kilometraje debe ser un número positivo."
  },
  status: {
    required: false,
    type: "string",
    enum: ["En Taller", "En Espera", "Listo", "Entregado"],
    message: "El estado debe ser: 'En Taller', 'En Espera', 'Listo' o 'Entregado'."
  }
};