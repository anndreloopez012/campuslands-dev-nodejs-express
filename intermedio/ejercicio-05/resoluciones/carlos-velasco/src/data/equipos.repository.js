const { EquipoRepository } = require('../repositories/equipo.repository');

const seed = [
  { id: 1, name: 'Estrellas del Norte', ciudad: 'Quito', tipo: 'futbol', titulos: 12 },
  { id: 2, name: 'Vetas Futsal', ciudad: 'Cusco', tipo: 'futsal', titulos: 5 },
  { id: 3, name: 'Guardianes FC', ciudad: 'Guadalajara', tipo: 'futbol', titulos: 9 }
];

const repository = new EquipoRepository(seed);
module.exports = repository;
