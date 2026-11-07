const { reglas } = require('../validators/reglas');

const tiposValidos = ['sport', 'naked', 'trail', 'scooter'];

const motorSchema = {
  modelo: [[reglas.requerido('es obligatorio'), reglas.texto(3, 40)]],
  marca: [[reglas.requerido('es obligatorio'), reglas.texto(2, 25)]],
  cilindrada: [[reglas.requerido('es obligatorio'), reglas.entero(50, 2500)]],
  tipo: [[reglas.requerido('es obligatorio'), reglas.enum(tiposValidos)]],
  precio: [[reglas.requerido('es obligatorio'), reglas.numero(0.1)]]
};

const ordenSchema = {
  motorId: [[reglas.requerido('es obligatorio'), reglas.entero(1, 1000)]],
  descripcion: [[reglas.requerido('es obligatorio'), reglas.texto(10, 140)]],
  horas: [[reglas.requerido('es obligatorio'), reglas.numero(0.5)]]
};

module.exports = { motorSchema, ordenSchema, tiposValidos };
